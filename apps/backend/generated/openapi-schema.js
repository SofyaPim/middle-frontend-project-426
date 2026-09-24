/* eslint eslint-comments/no-unlimited-disable: off */
/* eslint-disable */
// This document was generated automatically by openapi-box

/**
 * @typedef {import('@sinclair/typebox').TSchema} TSchema
 */

/**
 * @template {TSchema} T
 * @typedef {import('@sinclair/typebox').Static<T>} Static
 */

/**
 * @typedef {import('@sinclair/typebox').SchemaOptions} SchemaOptions
 */

/**
 * @typedef {{
 *  [Path in keyof typeof schema]: {
 *    [Method in keyof typeof schema[Path]]: {
 *      [Prop in keyof typeof schema[Path][Method]]: typeof schema[Path][Method][Prop] extends TSchema ?
 *        Static<typeof schema[Path][Method][Prop]> :
 *        undefined
 *    }
 *  }
 * }} SchemaType
 */

/**
 * @typedef {{
 *  [ComponentType in keyof typeof _components]: {
 *    [ComponentName in keyof typeof _components[ComponentType]]: typeof _components[ComponentType][ComponentName] extends TSchema ?
 *      Static<typeof _components[ComponentType][ComponentName]> :
 *      undefined
 *  }
 * }} ComponentType
 */

import { Type as T, TypeRegistry, Kind, CloneType } from '@sinclair/typebox'
import { Value } from '@sinclair/typebox/value'

/**
 * @typedef {{
 *  [Kind]: 'Binary'
 *  static: string | File | Blob | Uint8Array
 *  anyOf: [{
 *    type: 'object',
 *    additionalProperties: true
 *  }, {
 *    type: 'string',
 *    format: 'binary'
 *  }]
 * } & TSchema} TBinary
 */

/**
 * @returns {TBinary}
 */
const Binary = () => {
  /**
   * @param {TBinary} schema
   * @param {unknown} value
   * @returns {boolean}
   */
  function BinaryCheck(schema, value) {
    const type = Object.prototype.toString.call(value)
    return (
      type === '[object Blob]' ||
      type === '[object File]' ||
      type === '[object String]' ||
      type === '[object Uint8Array]'
    )
  }

  if (!TypeRegistry.Has('Binary')) TypeRegistry.Set('Binary', BinaryCheck)

  return /** @type {TBinary} */ ({
    anyOf: [
      {
        type: 'object',
        additionalProperties: true
      },
      {
        type: 'string',
        format: 'binary'
      }
    ],
    [Kind]: 'Binary'
  })
}

const ComponentsSchemasRubles = T.Integer({ format: 'int32', minimum: 0 })
const ComponentsSchemasProduct = T.Object({
  id: T.Integer({ format: 'int32' }),
  slug: T.String(),
  name: T.String(),
  category: T.String(),
  description: T.String(),
  price: T.Intersect([CloneType(ComponentsSchemasRubles)]),
  imageUrl: T.Optional(T.String()),
  createdAt: T.String({ format: 'date-time' }),
  updatedAt: T.String({ format: 'date-time' })
})
const ComponentsSchemasProductList = T.Object({
  products: T.Array(CloneType(ComponentsSchemasProduct))
})
const ComponentsSchemasErrorDetail = T.Object({
  field: T.Optional(T.String()),
  message: T.String()
})
const ComponentsSchemasApiError = T.Object({
  code: T.String(),
  message: T.String(),
  details: T.Optional(T.Array(CloneType(ComponentsSchemasErrorDetail)))
})
const ComponentsSchemasHealthStatus = T.Object({
  status: T.Literal('ok')
})

const schema = {
  '/api/products': {
    GET: {
      args: T.Void(),
      data: CloneType(ComponentsSchemasProductList, {
        'x-status-code': '200',
        'x-content-type': 'application/json'
      }),
      error: T.Union([
        CloneType(ComponentsSchemasApiError, {
          'x-status-code': '400',
          'x-content-type': 'application/json'
        }),
        CloneType(ComponentsSchemasApiError, {
          'x-status-code': '401',
          'x-content-type': 'application/json'
        }),
        CloneType(ComponentsSchemasApiError, {
          'x-status-code': '404',
          'x-content-type': 'application/json'
        }),
        CloneType(ComponentsSchemasApiError, {
          'x-status-code': '422',
          'x-content-type': 'application/json'
        }),
        CloneType(ComponentsSchemasApiError, {
          'x-status-code': '500',
          'x-content-type': 'application/json'
        })
      ])
    }
  },
  '/health': {
    GET: {
      args: T.Void(),
      data: CloneType(ComponentsSchemasHealthStatus, {
        'x-status-code': '200',
        'x-content-type': 'application/json'
      }),
      error: T.Union([T.Any({ 'x-status-code': 'default' })])
    }
  }
}

const _components = {
  schemas: {
    ApiError: CloneType(ComponentsSchemasApiError),
    ErrorDetail: CloneType(ComponentsSchemasErrorDetail),
    HealthStatus: CloneType(ComponentsSchemasHealthStatus),
    Product: CloneType(ComponentsSchemasProduct),
    ProductList: CloneType(ComponentsSchemasProductList),
    rubles: CloneType(ComponentsSchemasRubles)
  }
}

export { schema, _components as components }
