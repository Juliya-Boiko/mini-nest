import 'reflect-metadata'

export const INJECT_METADATA_KEY = Symbol('inject_tokens')

export function Inject(token?: any): ParameterDecorator {
  return (target, propertyKey, parameterIndex) => {
    const existing =
      Reflect.getMetadata(INJECT_METADATA_KEY, target) || {}

    existing[parameterIndex] = token

    Reflect.defineMetadata(
      INJECT_METADATA_KEY,
      existing,
      target
    )
  }
}
