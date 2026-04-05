import { describe, expect, it } from '@jest/globals'
import { buildAssetListFilter } from '@/services/asset-query.service'

describe('buildAssetListFilter', () => {
  it('builds a filter with status, escaped search, and user access rules', () => {
    const filter = buildAssetListFilter({
      search: 'summer(2024).mp4',
      status: 'completed',
      userId: 'user-1',
    })

    expect(filter).toMatchObject({
      status: 'completed',
      $and: [
        {
          $or: [{ userId: 'user-1' }, { sharedWith: 'user-1' }],
        },
      ],
    })
    expect(filter.$or).toHaveLength(4)
    expect(filter.$or[0].originalName).toBeInstanceOf(RegExp)
    expect(filter.$or[0].originalName.test('summer(2024).mp4')).toBe(true)
  })

  it('builds an image filter', () => {
    expect(buildAssetListFilter({ type: 'image' })).toEqual({
      type: { $regex: /^image\// },
    })
  })

  it('builds a video filter', () => {
    expect(buildAssetListFilter({ type: 'video' })).toEqual({
      type: { $regex: /^video\// },
    })
  })

  it('builds an other-media filter', () => {
    expect(buildAssetListFilter({ type: 'other' })).toEqual({
      type: { $not: /^(image|video)\// },
    })
  })
})
