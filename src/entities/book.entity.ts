import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';
import { Review } from './review.entity';

@Entity('books')
export class Book {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  title!: string;

  @Column()
  author!: string;

  @Column({ type: 'text', nullable: true })
  synopsis!: string;

  @Column({ nullable: true })
  genre!: string;

  @Column({ nullable: true })
  coverImage!: string;

  @Column({ type: 'date', nullable: true })
  publicationDate!: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @OneToMany(() => Review, (review) => review.book)
  reviews!: Review[];
}