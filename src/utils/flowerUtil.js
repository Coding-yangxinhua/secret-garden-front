import DS_FLOWER_INFO_LIST from '@/config/ds.flower.info'
import FLOWER_TRADE_LIST from '@/config/flower.trade'

import SG_FLOWER_INFO_LIST from '@/config/sg.flower.info'

let flowerNameMapCache = null

const getFlowerNameMap = () => {
  if (flowerNameMapCache) return flowerNameMapCache // 缓存命中直接返回
  flowerNameMapCache = (SG_FLOWER_INFO_LIST || []).reduce((map, item) => {
    // 非空判断
    if (item && item.id !== undefined && item.id !== null) {
      map.set(item.id, item)
    }
    return map
  }, new Map())
  return flowerNameMapCache
}

// 修正后
const getFlowerTradeMap = () => {
  return FLOWER_TRADE_LIST.reduce((map, item) => {
    if (item && item.id !== undefined && item.id !== null) {
      map.set(item.id, item)
    }
    return map
  }, new Map()) // 移除末尾多余的
}

const getFlowerTradeInfo = (flower) => {
  return getFlowerTradeMap()[flower.id]
}

const getAllFlowers = () => {
  const sg = SG_FLOWER_INFO_LIST.filter(
    (item) => item && item.id !== undefined && item.id !== null && item.name,
  ).map((item) => ({
    text: item.name,
    value: item.id,
  }))
  const ds = DS_FLOWER_INFO_LIST.filter(
    (item) => item && item.id !== undefined && item.id !== null && item.name,
  ).map((item) => ({
    text: item.name,
    value: item.id,
  }))
  return [[], sg, ds]
}

/**
 * 设置鲜花名称
 */
const initFlowerName = (flowerInfos) => {
  let flowerNameMap = getFlowerNameMap()
  flowerInfos.forEach((flower) => {
    // 安全判断：跳过空元素
    if (!flower) return
    // 提取 key 和 value
    const flowerItem = flowerNameMap.get(flower.key) // Map.get() 取值
    flower.value = flowerItem?.name || '未命名' // 可选链避免报错，兜底未命名
  })
}

export default {
  initFlowerName,
  getFlowerNameMap,
  getFlowerTradeMap,
  getFlowerTradeInfo,
  getAllFlowers,
}
