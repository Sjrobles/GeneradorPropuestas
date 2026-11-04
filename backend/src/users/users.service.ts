import { ConflictException, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { User, type UserDocument } from './schemas/user.schema'
import type { UserResponse } from './users.types'

interface CreateUserInput {
  email: string
  name: string
  passwordHash: string
}

interface GoogleUserInput {
  email: string
  googleSubject: string
  name: string
}

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async create(input: CreateUserInput): Promise<UserDocument> {
    try {
      return await this.userModel.create(input)
    } catch (error) {
      const code = (error as { code?: unknown } | null)?.code
      if (code === 11000) {
        throw new ConflictException('Ya existe una cuenta con este correo')
      }
      throw error
    }
  }

  findByEmailForAuthentication(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).select('+passwordHash').exec()
  }

  async findOrCreateGoogleUser(input: GoogleUserInput): Promise<UserDocument> {
    const existingUser = await this.userModel
      .findOne({
        $or: [{ googleSubject: input.googleSubject }, { email: input.email }],
      })
      .exec()
    if (existingUser) {
      if (existingUser.googleSubject === input.googleSubject) {
        return existingUser
      }
      existingUser.googleSubject = input.googleSubject
      return existingUser.save()
    }

    try {
      return await this.userModel.create(input)
    } catch (error) {
      const code = (error as { code?: unknown } | null)?.code
      if (code === 11000) {
        const concurrentUser = await this.userModel
          .findOne({
            $or: [
              { email: input.email },
              { googleSubject: input.googleSubject },
            ],
          })
          .exec()
        if (concurrentUser) return concurrentUser
      }
      throw error
    }
  }

  issuePasswordReset(
    email: string,
    tokenHash: string,
    expiresAt: Date,
    now: Date,
  ) {
    return this.userModel
      .findOneAndUpdate(
        {
          email,
          $or: [
            { passwordResetRequestedAt: { $exists: false } },
            {
              passwordResetRequestedAt: {
                $lt: new Date(now.getTime() - 60_000),
              },
            },
          ],
        },
        {
          $set: {
            passwordResetHash: tokenHash,
            passwordResetExpiresAt: expiresAt,
            passwordResetRequestedAt: now,
          },
        },
        { new: true },
      )
      .exec()
  }

  clearPasswordReset(id: string, tokenHash: string) {
    return this.userModel
      .updateOne(
        { _id: id, passwordResetHash: tokenHash },
        { $unset: { passwordResetHash: 1, passwordResetExpiresAt: 1 } },
      )
      .exec()
  }

  async hasValidPasswordReset(tokenHash: string) {
    return Boolean(
      await this.userModel.exists({
        passwordResetHash: tokenHash,
        passwordResetExpiresAt: { $gt: new Date() },
      }),
    )
  }

  consumePasswordReset(tokenHash: string, passwordHash: string) {
    return this.userModel
      .findOneAndUpdate(
        {
          passwordResetHash: tokenHash,
          passwordResetExpiresAt: { $gt: new Date() },
        },
        {
          $set: { passwordHash },
          $unset: { passwordResetHash: 1, passwordResetExpiresAt: 1 },
          $inc: { sessionVersion: 1 },
        },
        { new: true },
      )
      .exec()
  }

  findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec()
  }

  toResponse(user: UserDocument): UserResponse {
    return {
      createdAt: user.createdAt.toISOString(),
      email: user.email,
      id: user.id,
      name: user.name,
    }
  }
}
