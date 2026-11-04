import { validate } from 'class-validator'
import { validationException } from './validation-errors'
import { UpdateExecutionDetailsDto } from '../projects/dto/update-execution-details.dto'
import { SendChatMessageDto } from '../projects/dto/send-chat-message.dto'

describe('controlled validation messages', () => {
  it('accepts 10,000 characters for methodology intake', async () => {
    expect(
      await validate(
        Object.assign(new UpdateExecutionDetailsDto(), {
          activityDevelopment: 'a'.repeat(10000),
        }),
      ),
    ).toEqual([])
  })
  it('returns a Spanish correction when methodology exceeds 10,000 characters', async () => {
    const errors = await validate(
      Object.assign(new UpdateExecutionDetailsDto(), {
        activityDevelopment: 'a'.repeat(10001),
      }),
    )
    const response = validationException(errors).getResponse() as {
      message: string[]
    }
    expect(response.message[0]).toContain('10.000')
    expect(response.message[0]).not.toContain('must')
  })
  it('explains the chat answer limit instead of exposing validator messages', async () => {
    const errors = await validate(
      Object.assign(new SendChatMessageDto(), { content: 'a'.repeat(4001) }),
    )
    const response = validationException(errors).getResponse() as {
      message: string[]
    }
    expect(response.message[0]).toContain('4.000')
  })
})
