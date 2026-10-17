import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'

export type UserDocument = HydratedDocument<User>

@Schema({ collection: 'users', timestamps: true, versionKey: false })
export class User {
  @Prop({ type: String, trim: true, maxlength: 80, required: true })
  name!: string

  @Prop({
    type: String,
    trim: true,
    lowercase: true,
    maxlength: 160,
    required: true,
    unique: true,
    index: true,
  })
  email!: string

  @Prop({ type: String, select: false })
  passwordHash?: string

  @Prop({ type: String, unique: true, sparse: true, select: false })
  googleSubject?: string

  createdAt!: Date
  updatedAt!: Date
}

export const UserSchema = SchemaFactory.createForClass(User)
