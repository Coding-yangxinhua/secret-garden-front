import DS_FLOWER_INFO_LIST from '@/config/ds.flower.info'
import FLOWER_TRADE_LIST from '@/config/flower.trade'

import SG_FLOWER_INFO_LIST from '@/config/sg.flower.info'

let flowerNameMapCache = null
let sgFlowerMapCache = null
let dsFlowerMapCache = null

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

// 缓存SG鲜花映射
const getSGFlowerMap = () => {
  if (sgFlowerMapCache) return sgFlowerMapCache;
  sgFlowerMapCache = (SG_FLOWER_INFO_LIST || []).reduce((map, item) => {
    if (item && item.id !== undefined && item.id !== null && item.name) {
      map.set(item.id, item.name);
    }
    return map;
  }, new Map());
  return sgFlowerMapCache;
};

// 缓存DS鲜花映射
const getDSFlowerMap = () => {
  if (dsFlowerMapCache) return dsFlowerMapCache;
  dsFlowerMapCache = (DS_FLOWER_INFO_LIST || []).reduce((map, item) => {
    if (item && item.id !== undefined && item.id !== null && item.name) {
      map.set(item.id, item.name);
    }
    return map;
  }, new Map());
  return dsFlowerMapCache;
};

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
  return getFlowerTradeMap().get(flower.id) // 修复：使用 .get() 方法而不是 [] 访问
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
 * 根据游戏ID和鲜花ID获取鲜花名称
 * @param {string|number} gameId - 游戏ID
 * @param {string|number} flowerId - 鲜花ID
 * @returns {string} 鲜花名称，如果找不到则返回'未知鲜花'
 */
const getFlowerNameByGameAndFlowerId = (gameId, flowerId) => {
  // 根据游戏ID选择对应的鲜花映射
  if(gameId === 'sg' || gameId === 'SG') {
    const sgFlowerMap = getSGFlowerMap();
    return sgFlowerMap.get(flowerId) || '未知鲜花';
  } else if(gameId === 'ds' || gameId === 'DS') {
    const dsFlowerMap = getDSFlowerMap();
    return dsFlowerMap.get(flowerId) || '未知鲜花';
  } else {
    // 如果gameId不是sg也不是ds，则尝试在两个缓存映射中查找
    const sgFlowerMap = getSGFlowerMap();
    if(sgFlowerMap.has(flowerId)) {
      return sgFlowerMap.get(flowerId);
    }
    const dsFlowerMap = getDSFlowerMap();
    if(dsFlowerMap.has(flowerId)) {
      return dsFlowerMap.get(flowerId);
    }
    return '未知鲜花';
  }
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
  getFlowerNameByGameAndFlowerId
}
