import { describe, expect, it } from 'vitest'
import { profile, projects, strengths } from './resumeData'

describe('resume data', () => {
  it('contains the confirmed public profile and five work records', () => {
    expect(profile.email).toBe('cq030317@gmail.com')
    expect(profile.phone).toBe('185-1913-1780')
    expect(projects).toHaveLength(5)
    expect(projects.map((item) => item.organization)).toEqual(
      expect.arrayContaining(['中国内蒙古矿业有限公司', '中国网聚资本有限公司']),
    )
    expect(strengths).toHaveLength(4)
  })
})
