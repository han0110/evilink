/* eslint-disable no-constant-condition, no-await-in-loop */

// eslint-disable-next-line import/prefer-default-export
export const retryUntilSuccess = async <T>(
  fn: () => Promise<T>,
  interval: number,
  {
    beforeEach = () => {},
    afterSuccess = () => {},
    afterFailure = () => {},
  }: {
    beforeEach?: () => void
    afterSuccess?: (result: T) => void
    afterFailure?: (error: any) => void
  },
): Promise<T> => {
  beforeEach()
  return fn()
    .then((result) => {
      afterSuccess(result)
      return result
    })
    .catch(async (error) => {
      afterFailure(error)
      await new Promise((o) => setTimeout(o, interval))
      return retryUntilSuccess(fn, interval, {
        beforeEach,
        afterSuccess,
        afterFailure,
      })
    })
}
