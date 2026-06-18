import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Review } from 'src/entities/review.entity';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import { AffinityResultDto } from '../dto/affinity-result.dto';

interface RatingMap {
  [bookId: string]: number;
}

@Injectable()
export class AffinityService {
  constructor(
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  /**
   * Calcula el top N de usuarios más afines a uno dado,
   * usando similitud de coseno sobre los ratings de libros en común.
   */
  async getTopAffinities(
    userId: string,
    limit = 5,
  ): Promise<AffinityResultDto[]> {
    const targetRatings = await this.getUserRatingsMap(userId);

    if (Object.keys(targetRatings).length === 0) {
      return []; // el usuario no tiene reseñas, no hay base para comparar
    }

    // Candidatos: todos los usuarios excepto el propio
    const otherUsers = await this.userRepository.find({
      where: {},
      select: ['id', 'username'],
    });

    const results: AffinityResultDto[] = [];

    for (const candidate of otherUsers) {
      if (candidate.id === userId) continue;

      const candidateRatings = await this.getUserRatingsMap(candidate.id);
      const { score, sharedCount } = this.cosineSimilarity(
        targetRatings,
        candidateRatings,
      );

      if (sharedCount > 0) {
        results.push({
          userId: candidate.id,
          username: candidate.username,
          affinityScore: Math.round(score * 100) / 100, // redondeo a 2 decimales
          sharedBooksCount: sharedCount,
        });
      }
    }

    return results
      .sort((a, b) => b.affinityScore - a.affinityScore)
      .slice(0, limit);
  }

  /**
   * Obtiene un mapa { bookId: rating } de todas las reseñas de un usuario.
   */
  private async getUserRatingsMap(userId: string): Promise<RatingMap> {
    const reviews = await this.reviewRepository.find({
      where: { user: { id: userId } },
      relations: ['book'],
    });

    const map: RatingMap = {};
    for (const review of reviews) {
      map[review.book.id] = review.rating;
    }
    return map;
  }

  /**
   * Similitud de coseno calculada SOLO sobre los libros que ambos
   * usuarios reseñaron (intersección de sets), no sobre todo el catálogo.
   */
  private cosineSimilarity(
    ratingsA: RatingMap,
    ratingsB: RatingMap,
  ): { score: number; sharedCount: number } {
    const sharedBookIds = Object.keys(ratingsA).filter(
      (bookId) => bookId in ratingsB,
    );

    if (sharedBookIds.length === 0) {
      return { score: 0, sharedCount: 0 };
    }

    let dotProduct = 0;
    let magnitudeA = 0;
    let magnitudeB = 0;

    for (const bookId of sharedBookIds) {
      const ratingA = ratingsA[bookId];
      const ratingB = ratingsB[bookId];

      dotProduct += ratingA * ratingB;
      magnitudeA += ratingA ** 2;
      magnitudeB += ratingB ** 2;
    }

    const denominator = Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB);

    if (denominator === 0) {
      return { score: 0, sharedCount: sharedBookIds.length };
    }

    return {
      score: dotProduct / denominator,
      sharedCount: sharedBookIds.length,
    };
  }
}