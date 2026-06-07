<template>
  <main class="page-container">
    <version-checker ref="updateModalRef" v-show="currentUser.gameId == 2" />
    <!-- 顶部渐变装饰 -->
    <exchange-modal
      ref="exchangeModalRef"
      :default-open-id="currentUser.openId"
      @exchange-success="() => getConfig(true)"
    ></exchange-modal>
    <div class="fixed-top-card" v-if="config != null">
      <user-status-card
        class="user-status-card"
        v-if="systemUser.currentUser"
        :system-user="systemUser"
        @update:current-user="handleUserChange"
        @allot-success="() => getConfig(true)"
      />
    </div>

    <!-- 主要配置区域 -->
    <div class="config-wrapper" v-if="currentUser && currentUser?.subscribe?.subscribeId >= 0">
      <LoginConfig
        v-model:login="config.login"
        :current-user="currentUser"
        :next-run-time="nextRunTime"
        :schedule-time-info="accountInfo.scheduleTimeInfo"
        @get-config="getConfig"
        :key="currentUser?.id"
      />
      <!-- VIP用户配置 -->
      <div v-if="currentUser && currentUser?.subscribe?.subscribeId > 0" class="config-section">
        <van-popup v-model:show="showPlant" round position="bottom" class="custom-popup">
          <div class="popup-header">
            <span class="popup-title">选择种植模式</span>
          </div>
          <van-cascader
            v-model="cascaderValue"
            title="种植模式"
            :options="currentUser.gameId == 1 ? plantOptions : newPlantOptions"
            @close="showPlant = false"
            @finish="onFinishPlant"
            class="cascader-select"
          />
        </van-popup>
        <!-- 自动种植配置 -->
        <div class="config-card plant-config-card">
          <div class="card-header" @click="toggleExpand('plantConfig')">
            <van-icon name="flower-o" size="20" color="#52c41a" />
            <span class="card-title">自动种植</span>
            <van-icon
              name="arrow-down"
              size="16"
              :class="{ 'rotate-180': expandStates.plantConfig }"
              class="expand-icon"
            />
          </div>
          <div class="card-content" v-show="expandStates.plantConfig">
            <van-cell
              class="plant-mode-cell"
              center
              label="低于水滴阈值将不再种植"
              v-show="currentUser.gameId == 2"
            >
              <template #title>
                <span class="feature-title">水滴阈值</span>
              </template>
              <custom-array-stepper
                :min="0"
                :step="100"
                v-model="config.minWaterNum"
                :inputDisabled="false"
                class="steal-stepper"
              >
              </custom-array-stepper>
            </van-cell>
            <van-cell class="plant-mode-cell" center label="配置收获模式">
              <template #title>
                <span class="feature-title">收获模式</span>
              </template>
              <van-dropdown-menu class="feature-dropdown">
                <van-dropdown-item
                  v-model="config.autoHarvest"
                  :options="harvestOptions"
                  placeholder="请选择"
                  class="dropdown-item"
                />
              </van-dropdown-menu>
            </van-cell>
            <div v-show="config.autoHarvest == 2" class="order-advanced-section indent">
              <div class="section-title">
                <van-icon name="setting-o" size="16" color="#8c8c8c" />
                <span>收获定时设置</span>
              </div>

              <van-cell class="advanced-cell" title="定时收获" label="鲜花成熟后 N 秒收获">
                <van-stepper
                  v-model="config.harvestWaitingTime"
                  step="30"
                  integer
                  min="0"
                  theme="round"
                  button-size="24px"
                  class="stepper-control"
                />
              </van-cell>
            </div>

            <van-cell class="plant-mode-cell" center label="配置种植策略和时间计划">
              <template #title>
                <span class="feature-title">种植模式</span>
              </template>
              <van-field
                v-model="plantText"
                input-align="right"
                is-link
                readonly
                class="plant-selector"
                @click="showPlant = true"
                :placeholder="plantText || '请选择种植模式'"
              />
            </van-cell>

            <!-- 品质种植配置 -->
            <div v-if="config.autoPlant == 5" class="indent order-advanced-section">
              <div class="section-title">
                <van-icon name="star-o" size="16" color="#8c8c8c" />
                <span>品质种植配置</span>
              </div>
              <van-cell class="advanced-cell" title="补仓整齐" label="混乱or整齐，你喜欢哪个呢？">
                <template #right-icon>
                  <van-switch v-model="config.quality.tidy" size="24" />
                </template>
              </van-cell>
                            <van-cell class="advanced-cell" title="任务整齐(测试中，未开放)" label="任务/订单种的花也保持整齐（不再按需求数量种植）">
                <template #right-icon>
                  <van-switch v-model="config.quality.taskTidy" size="24" />
                </template>
              </van-cell>
              <van-cell class="advanced-cell" title="等级限制" label="低于该等级的鲜花不会种哦">
                <custom-array-stepper
                  :min="1"
                  :max="20"
                  :step="1"
                  v-model="config.quality.level"
                  :inputDisabled="false"
                  class="steal-stepper"
                >
                </custom-array-stepper>
              </van-cell>
              <!-- 总数量输入 -->
              <van-cell class="advanced-cell" title="总种类数量" label="设置所有品质的总种类数量">
                <custom-array-stepper
                  :options="[0, 1, 2, 4, 8, 16, 32, 64]"
                  :maxValueIndex="64"
                  :default-value="4"
                  v-model="config.quality.categoryNum"
                  :inputDisabled="false"
                  class="steal-stepper"
                >
                </custom-array-stepper>
              </van-cell>

              <!-- 品质选择按钮组 -->
              <QualityColorSelector v-model="config.quality.color" title="种植品质选择" />
            </div>

            <!-- 种植时间段配置 -->
            <div v-show="config.autoPlant == 1" class="plant-periods-section">
              <div class="section-title">
                <van-icon name="clock-o" size="16" color="#8c8c8c" />
                <span>种植时间配置</span>
              </div>

              <div v-if="config.periods.length === 0" class="empty-state">
                <van-empty description="暂无种植配置，点击添加按钮创建" class="empty-content" />
              </div>

              <div
                v-for="(period, index) in config.periods"
                :key="`plant-${index}`"
                class="config-item-row"
              >
                <div class="config-item-col seed-col">
                  <div class="config-item-label">种植种子</div>
                  <div class="config-item-value clickable" @click="showFlower(period)">
                    <span class="value-text">{{ period.seedName || '未选择' }}</span>
                    <van-icon
                      v-if="period.seedId"
                      :name="`${getBaseIconUrl()}${period.seedId}.png`"
                      class="seed-icon"
                    />
                    <van-icon v-else name="arrow" size="14" class="arrow-icon" />
                  </div>
                </div>

                <div class="config-item-col time-col">
                  <div class="config-item-label">开始时间</div>
                  <div class="config-item-value clickable" @click="showTime(period, 'beginTime')">
                    <span class="value-text">{{ formatTime(period.beginTime) }}</span>
                    <van-icon name="arrow" size="14" class="arrow-icon" />
                  </div>
                </div>

                <div class="config-item-col time-col">
                  <div class="config-item-label">结束时间</div>
                  <div class="config-item-value clickable" @click="showTime(period, 'endTime')">
                    <span class="value-text">{{ formatTime(period.endTime) }}</span>
                    <van-icon name="arrow" size="14" class="arrow-icon" />
                  </div>
                </div>

                <div class="config-item-col action-col">
                  <van-button
                    class="delete-button"
                    icon="delete-o"
                    size="mini"
                    type="danger"
                    plain
                    @click="deletePlant(index)"
                  />
                </div>
              </div>

              <van-button class="add-button" block type="primary" icon="add-o" @click="addPlant">
                添加种植配置
              </van-button>
            </div>
          </div>
        </div>
        <!-- 订单配置 -->
        <div class="config-card order-config-card">
          <div class="card-header" @click="toggleExpand('orderConfig')">
            <van-icon name="completed-o" size="20" color="#fa8c16" />
            <span class="card-title">订单管理</span>
            <van-icon
              name="arrow-down"
              size="16"
              :class="{ 'rotate-180': expandStates.orderConfig }"
              class="expand-icon"
            />
          </div>
          <div class="card-content" v-show="expandStates.orderConfig">
            <van-cell class="feature-cell" center label="若无订单所需鲜花，则会自动拒绝">
              <template #title>
                <span class="feature-title"
                  >{{
                    currentUser.gameId == 1 ? '客户' : currentUser.gameId == 2 ? '顾客' : '未知'
                  }}订单</span
                >
              </template>
              <van-dropdown-menu class="feature-dropdown">
                <van-dropdown-item
                  v-model="config.autoComplete"
                  :options="customerOptions"
                  placeholder="请选择"
                  class="dropdown-item"
                />
              </van-dropdown-menu>
            </van-cell>

            <van-cell class="feature-cell" center label="当订单所需鲜花不足时，会优先自动种植">
              <template #title>
                <span class="feature-title"
                  >{{
                    currentUser.gameId == 1 ? '鲜花' : currentUser.gameId == 2 ? '居民' : '未知'
                  }}订单</span
                >
              </template>
              <van-dropdown-menu class="feature-dropdown">
                <van-dropdown-item
                  v-model="config.autoSale"
                  :options="saleOptions"
                  placeholder="请选择"
                  class="dropdown-item"
                />
              </van-dropdown-menu>
            </van-cell>

            <!-- 订单高级配置 -->
            <div v-show="config.autoSale != 0" class="indent order-advanced-section">
              <div class="section-title">
                <van-icon name="setting-o" size="16" color="#8c8c8c" />
                <span>订单高级设置</span>
              </div>

              <div class="advanced-setting-group">
                <van-cell class="advanced-cell" title="居民订单数量上限">
                  <custom-array-stepper
                    :min="0"
                    :max="currentUser.gameId == 1 ? 1500 : 1200"
                    :step="100"
                    v-model="config.order.orderMaxNum"
                    :inputDisabled="false"
                    class="steal-stepper"
                  >
                  </custom-array-stepper>
                </van-cell>

                <van-cell
                  v-if="currentUser.gameId == 2"
                  class="advanced-cell"
                  title="云布订单数量上限"
                >
                  <custom-array-stepper
                    v-model="config.order.clothOrderMaxNum"
                    :min="0"
                    :max="120"
                    :step="20"
                    :inputDisabled="false"
                    class="steal-stepper"
                  >
                  </custom-array-stepper>
                </van-cell>

                <van-cell
                  v-if="currentUser.gameId == 2"
                  class="advanced-cell"
                  title="材料订单数量上限"
                >
                  <custom-array-stepper
                    v-model="config.order.materialOrderMaxNum"
                    :min="0"
                    :max="120"
                    :step="20"
                    :inputDisabled="false"
                    class="steal-stepper"
                  >
                  </custom-array-stepper>
                </van-cell>

                <van-cell
                  class="advanced-cell"
                  :title="currentUser.gameId == 1 ? '订单挑战自动完成' : '组团订单自动完成'"
                  :label="currentUser.gameId == 1 ? '自动参与订单相关挑战任务' : '自动完成团单'"
                >
                  <van-dropdown-menu class="feature-dropdown">
                    <van-dropdown-item
                      v-model="config.order.autoChallenge"
                      :options="challengeOptions"
                      placeholder="请选择"
                      class="dropdown-item"
                    />
                  </van-dropdown-menu>
                </van-cell>

                <div
                  class="advanced-setting-group"
                  v-show="currentUser.gameId == 2 && config.order.autoChallenge > 0"
                >
                  <!-- 【新增】种子开关 -->
                  <van-cell class="advanced-cell" title="种子筛选" :label="'只提交有种子的鲜花'">
                    <template #right-icon>
                      <van-switch v-model="config.order.seedOnly" size="24" />
                    </template>
                  </van-cell>
                  <!-- 【修改】品质选择区域 -->
                  <van-cell
                    class="advanced-cell"
                    title="品质选择"
                    label="只会提交选择的品质"
                    @click="toggleExpand('colorSelection')"
                  >
                    <template #right-icon>
                      <van-icon
                        name="arrow-down"
                        size="16"
                        :class="{ 'rotate-180': expandStates.colorSelection }"
                      />
                    </template>
                  </van-cell>

                  <!-- 【新增】品质选择按钮组展开内容 -->

                  <!-- 在订单管理部分的品质选择区域 -->
                  <div v-show="expandStates.colorSelection" class="color-selection-section">
                    <QualityColorSelector
                      v-model="config.order.color"
                      title="订单品质选择"
                      :show-title="false"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- 小号配置 -->
        <div class="config-card alt-config-card" v-if="currentUser.gameId == 1">
          <div class="card-header" @click="toggleExpand('altConfig')">
            <van-icon name="friends-o" size="20" color="#1890ff" />
            <span class="card-title">小号管理</span>
            <van-icon
              name="arrow-down"
              size="16"
              :class="{ 'rotate-180': expandStates.altConfig }"
              class="expand-icon"
            />
          </div>
          <div class="card-content" v-show="expandStates.altConfig">
            <van-cell
              class="feature-cell"
              center
              label="只有配置的小号能进行摸花/爬架或使用完整功能"
            >
              <template #title>
                <span class="feature-title">小号功能启用</span>
              </template>
              <template #right-icon>
                <van-switch :disabled="!config" v-model="config.autoAccept" size="24" />
              </template>
            </van-cell>

            <!-- 小号列表配置 -->
            <div v-show="config.autoAccept" class="alt-list-section">
              <div class="section-title">
                <van-icon name="user-o" size="16" color="#8c8c8c" />
                <span>小号列表</span>
              </div>

              <div v-if="accountInfo.userAlts.length === 0" class="empty-state">
                <van-empty description="暂无小号配置，点击添加按钮创建" class="empty-content" />
              </div>

              <div
                v-for="(alt, index) in accountInfo.userAlts"
                :key="`alt-${index}`"
                class="config-item-row"
              >
                <div class="config-item-col alt-name-col">
                  <div class="config-item-label">小号名称</div>
                  <div class="config-item-value clickable" @click="showFriendAccept(alt)">
                    <span class="value-text">{{ alt.userName || '未选择' }}</span>
                    <van-icon name="arrow" size="14" class="arrow-icon" />
                  </div>
                </div>

                <div class="config-item-col alt-type-col">
                  <div class="config-item-label">权限类型</div>
                  <van-dropdown-menu class="alt-type-dropdown">
                    <van-dropdown-item
                      v-model="alt.type"
                      :options="currentUser.subscribe.ratio > 0 ? altOptions1 : altOptions"
                      placeholder="请选择"
                      class="dropdown-item"
                    />
                  </van-dropdown-menu>
                </div>

                <div class="config-item-col action-col">
                  <van-button
                    class="delete-button"
                    icon="delete-o"
                    size="mini"
                    type="danger"
                    plain
                    @click="deleteUserAlts(index)"
                  />
                </div>
              </div>

              <van-button class="add-button" block type="primary" icon="add-o" @click="addUserAlts">
                添加小号配置
              </van-button>
            </div>
          </div>
        </div>
        <StealConfig
          v-if="currentUser.gameId == 2"
          :user="currentUser"
          :config="config"
          :friends="currentUser.gameUser.friends || []"
          :expand-states="expandStates"
          @update:config="handleConfigUpdate"
          @update-expand-states="handleExpandStateUpdate"
        />
        <!-- 自动摸花 -->
        <div class="config-card steal-config-card" v-if="currentUser.gameId == 1">
          <div class="card-header" @click="toggleExpand('stealConfig')">
            <van-icon name="gift-o" size="20" color="#ff6767" />
            <span class="card-title">摸花管理</span>
            <van-icon
              name="arrow-down"
              size="16"
              :class="{ 'rotate-180': expandStates.stealConfig }"
              class="expand-icon"
            />
          </div>
          <div class="card-content" v-show="expandStates.stealConfig">
            <van-cell class="feature-cell" center label="可配置摸花好友、花种和次数上限">
              <template #title>
                <span class="feature-title">摸花功能启用</span>
              </template>
              <template #right-icon>
                <van-switch :disabled="!config" v-model="config.autoSteal" size="24" />
              </template>
            </van-cell>

            <!-- 摸花配置列表 -->
            <div v-show="config.autoSteal" class="steal-list-section">
              <div class="section-title">
                <van-icon name="flower-o" size="16" color="#8c8c8c" />
                <span>摸花配置</span>
              </div>

              <div v-if="config.steals.length === 0" class="empty-state">
                <van-empty description="暂无摸花配置，点击添加按钮创建" class="empty-content" />
              </div>
              <div
                v-for="(steal, index) in config.steals"
                :key="`steal-${index}`"
                class="config-item-row steal-row"
              >
                <div class="config-item-col friend-col">
                  <div class="config-item-label">目标好友</div>
                  <div class="config-item-value clickable" @click="showFriendSteal(steal, false)">
                    <span class="value-text">{{ steal.townName || '未选择' }}</span>
                    <van-icon name="arrow" size="14" class="arrow-icon" />
                  </div>
                </div>

                <div class="config-item-col flower-col">
                  <div class="config-item-label">摸花花种</div>
                  <div class="config-item-value clickable" @click="showFriendFlower(steal)">
                    <span class="value-text">{{ steal.seedName || '未选择' }}</span>
                    <van-icon name="arrow" size="14" class="arrow-icon" />
                  </div>
                </div>

                <div class="config-item-col count-col">
                  <div class="config-item-label">摸花次数</div>
                  <van-stepper
                    v-model="steal.stealCount"
                    min="10"
                    :max="steal.maxExchangeCount"
                    step="5"
                    integer
                    size="small"
                    class="steal-stepper"
                  />
                </div>

                <div class="config-item-col switch-col">
                  <div class="config-item-label">启用状态</div>
                  <van-switch :disabled="!config" v-model="steal.enable" size="20" />
                </div>

                <div class="config-item-col action-col">
                  <van-button
                    class="delete-button"
                    icon="delete-o"
                    size="mini"
                    type="danger"
                    plain
                    @click="deleteSteal(index)"
                  />
                </div>
              </div>

              <van-button class="add-button" block type="primary" icon="add-o" @click="addSteal">
                添加摸花配置
              </van-button>
            </div>
          </div>
        </div>

        <!-- 自动上架下架 -->
        <div class="config-card steal-config-card" v-if="currentUser.gameId == 1">
          <div class="card-header" @click="toggleExpand('tradeConfig')">
            <van-icon name="cart-o" size="20" color="#ff6767" />
            <span class="card-title">店铺管理</span>
            <van-icon
              name="arrow-down"
              size="16"
              :class="{ 'rotate-180': expandStates.tradeConfig }"
              class="expand-icon"
            />
          </div>
          <div class="card-content" v-show="expandStates.tradeConfig">
            <van-cell class="feature-cell" center label="">
              <template #title>
                <span class="feature-title">自动上架</span>
              </template>
              <template #right-icon>
                <van-switch :disabled="!config" v-model="config.autoTradeOut" size="24" />
              </template>
            </van-cell>

            <!-- 上架配置列表 -->
            <div v-show="config.autoTradeOut" class="steal-list-section">
              <div class="section-title">
                <van-icon name="cash-o" size="16" color="#8c8c8c" />
                <span>上架设置</span>
              </div>

              <div v-if="config.trade?.outs?.length === 0" class="empty-state">
                <van-empty description="暂无上架配置，点击添加按钮创建" class="empty-content" />
              </div>
              <div
                v-for="(out, index) in config.trade?.outs"
                :key="`out-${index}`"
                class="config-item-row steal-row"
              >
                <div class="config-item-col trade-col">
                  <div class="config-item-label">上架鲜花</div>
                  <div class="config-item-value clickable" @click="showFlower(out)">
                    <span class="value-text">{{ out.seedName || '未选择' }}</span>
                    <van-icon name="arrow" size="14" class="arrow-icon" />
                  </div>
                </div>
                <div class="config-item-col count-col">
                  <div class="config-item-label">上架价格</div>
                  <custom-array-stepper
                    :options="tradeInfo(out)"
                    :default-value="tradeInfo(out)[1]"
                    v-model="out.price"
                    class="steal-stepper"
                  >
                  </custom-array-stepper>
                </div>

                <div class="config-item-col count-col">
                  <div class="config-item-label">上架次数</div>
                  <van-stepper
                    v-model="out.count"
                    min="0"
                    integer
                    size="small"
                    class="steal-stepper"
                  />
                </div>

                <div class="config-item-col count-col">
                  <div class="config-item-label">密码</div>
                  <van-field
                    v-model="out.password"
                    type="number"
                    inputmode="numeric"
                    maxlength="4"
                    placeholder="设置四位密码"
                    clearable
                    style="padding: 0px"
                  />
                </div>

                <div class="config-item-col switch-col">
                  <div class="config-item-label">启用状态</div>
                  <van-switch v-model="out.enable" size="20" />
                </div>

                <div class="config-item-col action-col">
                  <van-button
                    class="delete-button"
                    icon="delete-o"
                    size="mini"
                    type="danger"
                    plain
                    @click="deleteTradeOut(index)"
                  />
                </div>
              </div>

              <van-button class="add-button" block type="primary" icon="add-o" @click="addTradeOut">
                添加上架配置
              </van-button>
            </div>
          </div>

          <div class="card-content" v-show="expandStates.tradeConfig">
            <van-cell class="feature-cell" center label="">
              <template #title>
                <span class="feature-title">自动购买</span>
              </template>
              <template #right-icon>
                <van-switch :disabled="!config" v-model="config.autoTradeIn" size="24" />
              </template>
            </van-cell>

            <!-- 购买配置列表 -->
            <div v-show="config.autoTradeIn" class="steal-list-section">
              <div class="section-title">
                <van-icon name="paid" size="16" color="#8c8c8c" />
                <span>购买设置</span>
              </div>

              <div v-if="config.trade.ins.length === 0" class="empty-state">
                <van-empty description="暂无购买配置，点击添加按钮创建" class="empty-content" />
              </div>
              <div
                v-for="(inc, index) in config.trade.ins"
                :key="`in-${index}`"
                class="config-item-row steal-row"
              >
                <div class="config-item-col trade-col">
                  <div class="config-item-label">目标好友</div>
                  <div class="config-item-value clickable" @click="showFriendSteal(inc, false)">
                    <span class="value-text">{{ inc.townName || '未选择' }}</span>
                    <van-icon name="arrow" size="14" class="arrow-icon" />
                  </div>
                </div>

                <div class="config-item-col trade-col">
                  <div class="config-item-label">目标鲜花</div>
                  <div class="config-item-value clickable" @click="showFriendFlower(inc)">
                    <span class="value-text">{{ inc.seedName || '未选择' }}</span>
                    <van-icon name="arrow" size="14" class="arrow-icon" />
                  </div>
                </div>

                <div class="config-item-col count-col">
                  <div class="config-item-label">购买价格</div>
                  <custom-array-stepper
                    :options="tradeInfo(inc)"
                    :default-value="tradeInfo(inc)[1]"
                    :inputDisabled="true"
                    v-model="inc.price"
                    class="steal-stepper"
                  >
                  </custom-array-stepper>
                </div>
                <div class="config-item-col count-col">
                  <div class="config-item-label">每日购买数量</div>
                  <van-stepper
                    v-model="inc.count"
                    min="-1"
                    step="100"
                    integer
                    size="small"
                    class="steal-stepper"
                  />
                </div>

                <div class="config-item-col count-col">
                  <div class="config-item-label">密码</div>
                  <van-field
                    v-model="inc.password"
                    type="number"
                    inputmode="numeric"
                    maxlength="4"
                    placeholder="设置四位密码"
                    clearable
                    style="padding: 0px"
                  />
                </div>
                <div class="config-item-col switch-col">
                  <div class="config-item-label">启用状态</div>
                  <van-switch :disabled="!config" v-model="inc.enable" size="20" />
                </div>

                <div class="config-item-col action-col">
                  <van-button
                    class="delete-button"
                    icon="delete-o"
                    size="mini"
                    type="danger"
                    plain
                    @click="deleteTradeIn(index)"
                  />
                </div>
              </div>

              <van-button class="add-button" block type="primary" icon="add-o" @click="addTradeIn">
                添加购买配置
              </van-button>
            </div>
          </div>
        </div>
        <GuildConfig
          :user="currentUser"
          :config="config"
          :expand-states="expandStates"
          @update:config="handleConfigUpdate"
          @update-expand-states="handleExpandStateUpdate"
        />
        <!-- 【新增】兑换码模块 -->
        <div class="config-card other-features-card" v-if="currentUser.gameId == 2">
          <div class="card-header" @click="toggleExpand('exchangeCodeConfig')">
            <van-icon name="gift-o" size="20" color="#ff6767" />
            <span class="card-title">兑换码功能</span>
            <van-icon
              name="arrow-down"
              size="16"
              :class="{ 'rotate-180': expandStates.exchangeCodeConfig }"
              class="expand-icon"
            />
          </div>
          <div class="card-content" v-show="expandStates.exchangeCodeConfig">
            <van-cell class="feature-cell" center label="开启后系统将自动兑换可用的兑换码">
              <template #title>
                <span class="feature-title">自动兑换</span>
              </template>
              <template #right-icon>
                <van-switch :disabled="!config" v-model="config.autoExchange" size="24" />
              </template>
            </van-cell>

            <div class="exchange-code-section">
              <div class="section-title">
                <van-icon name="share-o" size="16" color="#8c8c8c" />
                <span>分享兑换码</span>
              </div>

              <van-cell class="advanced-cell" title="分享兑换码" label="分享成功将奖励一天VIP">
                <div class="exchange-code-input-container">
                  <van-field
                    v-model="exchangeCodeInput"
                    :placeholder="lastestCdKey"
                    class="exchange-code-input"
                  />
                  <van-button
                    type="primary"
                    size="small"
                    @click="submitExchangeCode"
                    :loading="isSubmitting"
                  >
                    提交
                  </van-button>
                </div>
              </van-cell>
            </div>
          </div>
        </div>
        <ActivityConfig
          :user="currentUser"
          :config="config"
          :expand-states="expandStates"
          @update:config="handleConfigUpdate"
          @update-expand-states="handleExpandStateUpdate"
        />

        <AutoAdConfig
          v-if="currentUser.gameId == 2"
          :user="currentUser"
          :config="config"
          :expand-states="expandStates"
          @update:config="handleConfigUpdate"
          @update-expand-states="handleExpandStateUpdate"
        />

        <other-config
          :user="currentUser"
          :config="config"
          :expand-states="expandStates"
          @update:config="handleConfigUpdate"
          @update:expand-states="handleExpandStateUpdate"
        />
      </div>
      <div
        v-if="!currentUser?.subscribe || currentUser?.subscribe?.subscribeId < 1"
        class="config-section non-vip-section"
      >
        <!-- 升级提示 -->
        <div class="upgrade-tip-card">
          <div class="upgrade-icon">
            <van-icon name="arrow-up" size="24" color="#faad14" />
          </div>
          <div class="upgrade-content">
            <div class="upgrade-title">升级VIP解锁更多功能</div>
            <div class="upgrade-desc">自动种植、订单管理、社团功能、资源自动领取等更多高级功能</div>
          </div>
          <van-button type="warning" size="small" plain class="upgrade-btn" @click="toggleExpand">
            立即升级
          </van-button>
        </div>
      </div>

      <!-- 弹出选择器 -->
      <van-popup v-model:show="showTimePicker" round position="bottom" class="custom-popup">
        <div class="popup-header">
          <span class="popup-title">选择时间</span>
        </div>
        <van-time-picker :formatter="formatter" @confirm="confirmTime" class="custom-time-picker" />
      </van-popup>

      <van-popup v-model:show="showFlowerPicker" round position="bottom" class="custom-popup">
        <div class="popup-header">
          <span class="popup-title">选择花种</span>
        </div>
        <van-field
          placeholder="搜索花种名称..."
          right-icon="search"
          clearable
          v-model="searchSeed"
          @update:model-value="filterSeed"
          class="search-field"
        />
        <van-picker
          :columns="seedList"
          @confirm="confirmFlower"
          class="custom-picker"
          show-toolbar
          cancel-button-text="取消"
          confirm-button-text="确认"
        />
      </van-popup>

      <van-popup v-model:show="showFriendPicker" round position="bottom" class="custom-popup">
        <div class="popup-header">
          <span class="popup-title">选择好友</span>
        </div>
        <van-field
          placeholder="搜索好友名称..."
          right-icon="search"
          clearable
          v-model="searchFriend"
          @update:model-value="filterFriend"
          class="search-field"
        />
        <van-picker
          :columns="friendList"
          @confirm="confirmFriend"
          class="custom-picker"
          show-toolbar
          cancel-button-text="取消"
          confirm-button-text="确认"
        />
      </van-popup>
    </div>
    <!-- 【新增】底部导航栏 -->
    <!-- 使用底部导航栏组件 -->
    <bottom-nav
      :running-status="runningStatus"
      :exchange-modal-ref="exchangeModalRef"
      :account-modal-ref="accountModalRef"
      @save-config="saveConfig"
      @to-log="toLog"
      @trigger-robot="triggerRobot"
      @open-exchange-modal="openExchangeModal"
      @open-account-modal="openAccountModal"
      @handle-user-action="handleUserAction"
      @go-to-profile="goToProfile"
      @go-to-security="goToSecurity"
      @logout="logout"
    />
    <account-bind-modal
      ref="accountModalRef"
      :default-open-id="currentUserId"
      @account-updated="handleAccountUpdated"
    >
    </account-bind-modal>
  </main>
</template>

<script setup>
import { onMounted, ref, computed, watch } from 'vue'
import request from '@/utils/request'
import { showLoadingToast, showNotify } from 'vant'
import flowerUtil from '@/utils/flowerUtil'
import CustomArrayStepper from '@/components/CustomArrayStepper.vue'
import ExchangeModal from '@/components/ExchangeModal.vue'
import router from '@/router'
import AccountBindModal from '@/components/AccountBindModal.vue'
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/stores/user'
import VersionChecker from '@/components/VersionChecker.vue'
import StealConfig from '@/components/StealConfigModal.vue'
import QualityColorSelector from '@/components/QualityColorSelector.vue'
import AutoAdConfig from '@/components/AutoAdConfig.vue'
import BottomNav from '@/components/BottomNav.vue'
import userStatusCard from '@/components/UserStatusCard.vue'
import GuildConfig from '@/components/GuildConfig.vue'
import OtherConfig from '@/components/OtherConfig.vue'
import ActivityConfig from '@/components/ActivityConfig.vue'
import { isEqual, cloneDeep } from 'lodash-es'
import LoginConfig from '@/components/LoginConfig.vue'

// 替换原来的比较方法（删除旧的，用这个）
const areConfigsEqual = (obj1, obj2) => {
  return isEqual(obj1, obj2)
}

const userStore = useUserStore()

const updateModalRef = ref(null)

// 搜索内容
const searchSeed = ref('')
const searchFriend = ref('')
const seedList = ref([])
const friendList = ref([])
const friends = ref([])
const saveToast = ref()
const nextRunTime = ref(0)

// 配置选项
const customerOptions = [
  { text: '关闭', value: 0 },
  { text: '缺库存补种', value: 1 },
  { text: '缺库存不管', value: 2 },
  { text: '缺库存拒绝', value: 3 },
]

const saleOptions = [
  { text: '关闭', value: 0 },
  { text: '缺库存补种', value: 1 },
  { text: '缺库存不管', value: 2 },
]

const harvestOptions = [
  { text: '自动', value: 0 },
  { text: '手动', value: 1 },
  { text: '定时', value: 2 },
]

const challengeOptions = [
  { text: '关闭', value: 0 },
  { text: '免费挑战', value: 1 },
  { text: '付费挑战', value: 2 },
]

// 任务配置选项
const taskOptions = [
  { id: 2005, title: '材料商店购买' },
  { id: 20003, title: '培育鲜花' },
  { id: 20007, title: '顾客订单' },
  { id: 20009, title: '居民订单' },
  { id: 20010, title: '珍珠雇佣' },
  { id: 20011, title: '皇室特供订单' },
  { id: 20015, title: '升级鲜花' },
  { id: 20036, title: 'VIP商店购买（开发中）' },
  { id: 20045, title: '制作花艺' },
  { id: 20046, title: '收获鲜花' },
]

const hd17Options = [
  { id: 20008, title: '种植鲜花' },
  { id: 20007, title: '顾客订单' },
  { id: 20009, title: '居民订单' },
  { id: 20010, title: '珍珠雇佣' },
  { id: 20019, title: '花艺售卖' },
]

const altOptions = [{ text: '基础功能（摸花/爬架子）', value: 0 }]
const altOptions1 = [
  { text: '基础功能（摸花/爬架子）', value: 0 },
  { text: '完整功能', value: 1 },
]

const plantOptions = [
  { text: '关闭', value: 0 },
  {
    text: '补仓',
    value: 2,
    children: [
      { text: '鲜花>=1级', value: 2 },
      { text: '鲜花>8级', value: 3 },
      { text: '鲜花>12级', value: 4 },
    ],
  },
  { text: '自选', value: 1 },
]

const newPlantOptions = [
  { text: '关闭', value: 0 },
  { text: '自选', value: 1 },
  {
    text: '品质(补仓)',
    value: 5,
  },
]

const checkForUpdates = async () => {
  return await updateModalRef.value.checkVersionUpdate()
}

// 响应式数据
const systemUserLocal = storeToRefs(userStore).userInfo

const otherUsers = ref()
const currentUserId = ref(localStorage.getItem('currentUserId'))
const selectTime = ref()
const selectFlower = ref()
const showTimePicker = ref(false)
const showFlowerPicker = ref(false)
const showFriendPicker = ref(false)
const showPlant = ref(false)
const plantText = ref()
const friendInfo = ref({ flowers: [], exchangeCount: 10 })
const friendKey = ref()
const friendValue = ref()
const cascaderValue = ref([])
const tradeMap = flowerUtil.getFlowerTradeMap()
const exchangeModalRef = ref(null)
const accountModalRef = ref(null)

// 【新增】底部导航栏相关状态
const showMoreMenu = ref(false) // 控制"更多"二级菜单显示
const moreMenuRef = ref(null) // 更多菜单的DOM引用，用于点击外部关闭

// 【新增】用户菜单相关状态
const showUserMenu = ref(false) // 控制用户菜单显示

// 【新增】品质选择相关状态
const expandStates = ref({ colorSelection: false }) // 新增品质选择区域的展开状态

// 【新增】品质种植相关状态 - 现在通过config.quality访问
// config.value.quality = { categoryNum: 0, color: [] }

// 修改跟踪相关状态
const initialConfigState = ref(null) // 初始配置状态，用于比较
const hasUnsavedChanges = ref(false) // 是否有未保存的更改
const lastUserId = ref(null) // 记录上次获取配置的用户ID

// 【新增】兑换码相关状态
const exchangeCodeInput = ref('') // 兑换码输入框
const isSubmitting = ref(false) // 提交状态

const lastestCdKey = ref('暂无最新兑换码')

const openExchangeModal = () => {
  exchangeModalRef.value.openModal()
}

const openAccountModal = () => {
  if (systemUserLocal.value == null) {
    router.push({ name: 'login' })
    return
  }
  if (accountModalRef.value) {
    accountModalRef.value.openModal()
  }
}

// 处理账号更新回调
const handleAccountUpdated = () => {
  getConfig(true)
}

// 用户配置信息
const accountInfo = ref({
  runStatus: 0,
})

const gameId = computed(() => currentUser.value.gameId)

const systemUser = computed(
  () =>
    accountInfo.value.systemUser || {
      otherUsers: [],
      currentUser: null,
      times: {},
      userName: '',
      nickName: '',
    },
)

const currentUser = computed(
  () =>
    systemUser.value.currentUser || {
      refreshNeed: false,
      subscribe: { subscribeId: -1 },
      gameUser: {},
      userName: '',
    },
)

const config = computed(
  () =>
    accountInfo.value.config || {
      enable: false,
      autoPlant: 0,
      autoSale: false,
      flowers: [],
      periods: [],
      steals: [],
      userAlts: [],
      shopItems: [],
      autoComplete: 0,
      autoChallenge: 0,
      orderMaxNum: 0,
      cloudOrderMaxNum: 0, // 新增云布订单数量上限
      materialOrderMaxNum: 0, // 新增材料订单数量上限
      autoHarvest: 0,
      harvestWaitingTime: 30,
      autoAccept: false,
      autoSteal: false,
      autoSell: false,
      autoGuildPlant: false,
      autoDonate: 0,
      autoCultivate: false,
      autoShop: false,
      autoMonster: false,
      autoRob: false,
      betterGame: false,
      autoGame: false,
      autoBuy: false,
      altsUser: [],
      gameUser: { friends: [] },
      autoAd: false,
      autoGuildAd: false, // 新增社团广告开关
      autoExchange: false, // 新增兑换码开关
      autoHelp: false, // 新增公会协助开关
      autoRace: false, // 新增公会竞赛开关
      race: {
        // 新增竞赛配置JSON
        racePoint: 20,
        HighIgnore: false,
        pointFirst: false, // 新增积分优先开关
        tasks: [
          { id: 2005, status: 0 },
          { id: 20046, status: 0 },
          { id: 20011, status: 0 },
          { id: 20003, status: 0 },
          { id: 20009, status: 0 },
          { id: 20007, status: 0 },
          { id: 20015, status: 0 },
          { id: 20045, status: 0 },
        ],
      },
      // 【新增】品质种植配置
      quality: {
        categoryNum: 0,
        level: 1,
        tidy: 1,
        color: [],
      },
      // 【新增】活动配置
      activity: {
        hd17: {
          status: false,
          taskStar: 1,
          autoRefresh: false,
          autoFinish: 0, // 默认为0，表示关闭
          taskScore: 265, // 达成积分
          autoOffShelf: false, // 花艺自动下架
          tasks: [
            { id: 20008, status: 0 },
            { id: 20007, status: 0 },
            { id: 20009, status: 0 },
            { id: 20010, status: 0 },
            { id: 20019, status: 0 },
          ],
        },
      },
    },
)

const allFlowers = flowerUtil.getAllFlowers()

const runningStatus = computed(() => {
  // 需要重新登录
  if (currentUser.value.refreshNeed == 1) {
    return -1
  }
  // 运行中
  return currentUser.value.runStatus
})

const tradeInfo = (out) => {
  if (!out || !out.seedId) {
    return [0]
  }
  if (out.seedId == -1) {
    return ['低价', '平价', '高价']
  }
  const trade = tradeMap.get(out.seedId)
  if (trade == null) {
    return [0]
  }
  return [trade.minPrice, trade.defaultPrice, trade.maxPrice]
}

// 格式化时间
const formatTime = (milliseconds) => {
  const hours = Math.floor(milliseconds / (60 * 60 * 1000))
  const minutes = Math.floor((milliseconds % (60 * 60 * 1000)) / (60 * 1000))
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

// 日期转时间戳
const toTime = (timeArr) => {
  return (timeArr[0] * 60 * 60 + timeArr[1] * 60) * 1000
}

// 时间格式化器
const formatter = (type, option) => {
  if (type === 'hour') option.text += '时'
  if (type === 'minute') option.text += '分'
  return option
}

// 初始化折叠面板状态
const initExpandStates = () => {
  const userId = currentUserId.value || 'default'
  const savedStates = JSON.parse(localStorage.getItem(`expandStates_${userId}`) || '{}')

  expandStates.value = {
    mainSwitch: savedStates.mainSwitch ?? true,
    plantConfig: savedStates.plantConfig ?? true,
    orderConfig: savedStates.orderConfig ?? true,
    altConfig: savedStates.altConfig ?? true,
    stealConfig: savedStates.stealConfig ?? true,
    guildConfig: savedStates.guildConfig ?? true,
    otherFeatures: savedStates.otherFeatures ?? true,
    vip3Config: savedStates.vip3Config ?? true,
    tradeConfig: savedStates.tradeConfig ?? true,
    nonVipSteal: savedStates.nonVipSteal ?? true,
    tradeInConfig: savedStates.tradeInConfig ?? true,
    colorSelection: savedStates.colorSelection ?? false,
    exchangeCodeConfig: savedStates.exchangeCodeConfig ?? true,
    activityConfig: savedStates.activityConfig ?? true,
    adConfig: savedStates.adConfig ?? true,
  }
}

// 保存折叠状态到本地存储
const saveExpandState = (key, state) => {
  const userId = currentUserId.value || 'default'
  const states = JSON.parse(localStorage.getItem(`expandStates_${userId}`) || '{}')
  states[key] = state
  localStorage.setItem(`expandStates_${userId}`, JSON.stringify(states))
}

// 【改进】处理用户动作
const handleUserAction = () => {
  if (systemUserLocal.value) {
    // 如果已登录，打开用户菜单
    showUserMenu.value = true
  } else {
    // 如果未登录，跳转到登录页
    router.push({ name: 'login' })
  }
}

// 【新增】跳转到个人资料页面
const goToProfile = () => {
  showUserMenu.value = false
  // 这里可以跳转到用户资料页面
  console.log('跳转到个人资料页面')
}

// 【新增】跳转到安全设置页面
const goToSecurity = () => {
  showUserMenu.value = false
  // 这里可以跳转到安全设置页面
  console.log('跳转到安全设置页面')
}

// 【改进】登出功能
const logout = async () => {
  // 关闭菜单
  showUserMenu.value = false

  // 清除本地用户信息
  userStore.clearUserInfo()
  showNotify({
    type: 'success',
    message: '已成功退出登录',
    duration: 2000,
  })
}

const toLog = () => {
  router.push({
    name: 'log',
    query: { userId: currentUser.value.id },
  })
}

// 切换折叠状态
const toggleExpand = (key) => {
  expandStates.value[key] = !expandStates.value[key]
  saveExpandState(key, expandStates.value[key])
}

// 弹出层方法
const showTime = (period, field) => {
  selectTime.value = [period, field]
  showTimePicker.value = true
}

const showFlower = (flower) => {
  seedList.value = []
  seedList.value.push(
    ...allFlowers[gameId.value].filter((f) => accountInfo.value.flowers.includes(f.value)),
  )
  selectFlower.value = flower
  showFlowerPicker.value = true
}

const showFriendAccept = (accept) => {
  friendList.value = [...friends.value]
  friendKey.value = 'userName'
  friendValue.value = 'openId'
  selectFlower.value = accept
  showFriendPicker.value = true
}

const showFriendSteal = (steal, limit = true) => {
  friendKey.value = 'townName'
  friendValue.value = 'userId'
  let altUserOpenIds = accountInfo.value.altsUser.map((friend) => friend.openId)
  friendList.value = friends.value.filter(
    (friend) => altUserOpenIds.includes(friend.value) || !limit,
  )
  if (currentUser.value.subscribe.subscribeId != 0) {
    friendList.value = [{ value: '-1', text: '所有人' }, ...friendList.value]
  }
  selectFlower.value = steal
  showFriendPicker.value = true
}

const showFriendFlower = async (steal) => {
  let friendFlowerIds = [...friendInfo.value.flowers]
  seedList.value = [{ value: '-1', text: '所有花' }]
  seedList.value.push(
    ...allFlowers[gameId.value].filter(
      (flower) => friendFlowerIds.length == 0 || friendFlowerIds.includes(flower.value),
    ),
  )
  selectFlower.value = steal
  showFlowerPicker.value = true
}

// 确认选择
const confirmTime = ({ selectedValues }) => {
  const timestamp = toTime(selectedValues)
  selectTime.value[0][selectTime.value[1]] = timestamp
  showTimePicker.value = false
}

// 移除括号内容
const removeTextAfterBracket = (inputString) => {
  const bracketIndex = inputString.indexOf('（')
  return bracketIndex !== -1 ? inputString.substring(0, bracketIndex) : inputString
}

// 确认选择
const confirmFlower = ({ selectedOptions }) => {
  selectFlower.value['seedId'] = selectedOptions[0].value
  selectFlower.value['seedName'] = removeTextAfterBracket(selectedOptions[0].text)
  showFlowerPicker.value = false
}

const confirmFriend = async ({ selectedOptions }) => {
  let openId = selectedOptions[0].value
  selectFlower.value[friendValue.value] = openId
  selectFlower.value[friendKey.value] = selectedOptions[0].text
  showFriendPicker.value = false

  if (openId != null && openId != -1) {
    friendInfo.value = await getFriendInfo(openId)
  }
  selectFlower.value['maxExchangeCount'] = friendInfo.value.exchangeCount
}

const onFinishPlant = ({ selectedOptions }) => {
  showPlant.value = false
  plantText.value = selectedOptions.map((option) => option.text).join('并且')
  config.value.autoPlant = selectedOptions[selectedOptions.length - 1].value
  cascaderValue.value = []
}

const getExchangeCode = async () => {
  const { data } = await request({
    method: 'get',
    url: '/config/getCdKey',
  })
  lastestCdKey.value = data
}

// 【新增】提交兑换码
const submitExchangeCode = async () => {
  if (!exchangeCodeInput.value.trim()) {
    showNotify({
      type: 'warning',
      message: '请输入兑换码',
      duration: 2000,
      className: 'custom-notify',
    })
    return
  }

  isSubmitting.value = true

  try {
    const response = await request({
      method: 'get',
      url: '/config/shareCdKey',
      params: {
        userId: currentUserId.value,
        cdKey: exchangeCodeInput.value.trim(),
      },
    })

    if (response.code === 200) {
      showNotify({
        type: 'success',
        message: response.data || '提交成功',
        duration: 3000,
        className: 'custom-notify',
      })
      // 清空输入框
      exchangeCodeInput.value = ''
    } else {
      showNotify({
        type: 'danger',
        message: response.remark || '兑换码不存在或已被分享',
        duration: 3000,
        className: 'custom-notify',
      })
    }
  } catch (error) {
    showNotify({
      type: 'danger',
      message: '网络错误，请重试',
      duration: 3000,
      className: 'custom-notify',
    })
  } finally {
    isSubmitting.value = false
  }
}

// 添加/删除配置
const addPlant = () => {
  config.value.periods.push({
    beginTime: 0,
    endTime: 86400000,
    seedId: '',
    seedName: '未选择',
  })
}

const addSteal = () => {
  config.value.steals.push({
    userId: '-1',
    townName: '所有人',
    seedId: '-1',
    seedName: '所有花',
    stealCount: 10,
    maxExchangeCount: 20,
    enable: true,
  })
}

const addTradeOut = () => {
  config.value.trade.outs.push({
    seedId: '-2',
    seedName: '无',
    price: 0,
    count: -1,
    enable: true,
  })
}

const addTradeIn = () => {
  config.value.trade.ins.push({
    seedId: '-1',
    seedName: '所有花',
    price: 0,
    count: -1,
    enable: true,
  })
}

const addUserAlts = () => {
  accountInfo.value.userAlts.push({
    openId: '',
    userName: '',
    type: 0,
  })
}

const deletePlant = (index) => {
  config.value.periods.splice(index, 1)
}

const deleteSteal = (index) => {
  config.value.steals.splice(index, 1)
}

const deleteTradeOut = (index) => {
  config.value.trade.outs.splice(index, 1)
}

const deleteTradeIn = (index) => {
  config.value.trade.ins.splice(index, 1)
}

const deleteUserAlts = (index) => {
  accountInfo.value.userAlts.splice(index, 1)
}

// 更新修改跟踪状态
const updateChangeTracking = () => {
  if (!initialConfigState.value) {
    // 首次加载时保存初始状态
    initialConfigState.value = cloneDeep(config.value)
    hasUnsavedChanges.value = false
    return
  }

  // 比较当前配置和初始状态
  hasUnsavedChanges.value = !areConfigsEqual(initialConfigState.value, config.value)
}

// 保存配置
const saveConfig = async () => {
  if (currentUser.value.gameId == 2 && (await checkForUpdates())) {
    return
  }

  if (!accountInfo.value) return

  let url = '/config/update'
  if (currentUserId.value) {
    url = url + '?userId=' + currentUserId.value
  }

  saveToast.value = showLoadingToast({
    duration: 0,
    forbidClick: true,
    message: '保存中...',
    loadingType: 'spinner',
    className: 'custom-loading-toast',
  })

  try {
    const { flowers, ...newData } = accountInfo.value || {}
    const { code, remark } = await request({
      method: 'post',
      url,
      data: newData,
    })

    if (code === 200) {
      showNotify({
        type: 'success',
        message: '保存成功',
        duration: 2000,
        className: 'custom-notify',
      })

      // 更新初始状态，标记为已保存
      initialConfigState.value = cloneDeep(config.value)
      hasUnsavedChanges.value = false

      // 保存成功后刷新最新配置（含 scheduleTimeInfo 等实时数据）
      await getConfig()
    } else {
      showNotify({
        type: 'danger',
        message: remark || '保存失败',
        duration: 3000,
        className: 'custom-notify',
      })
    }
  } catch (error) {
    showNotify({
      type: 'danger',
      message: '网络错误，请重试',
      duration: 3000,
      className: 'custom-notify',
    })
  } finally {
    saveToast.value?.close()
  }
}

// 获取好友信息
const getFriendInfo = async (openId) => {
  try {
    const { data } = await request({
      method: 'get',
      url: `/config/friendFlowers?userId=${currentUserId.value}&openId=${openId}`,
    })
    return data
  } catch (error) {
    showNotify({
      type: 'danger',
      message: '获取好友信息失败，请重新登录游戏',
      duration: 3000,
      className: 'custom-notify',
    })
    return { flowers: [], exchangeCount: 10 }
  }
}

const restartRobot = async () => {
  // 如果正在运行，重启
  if (runningStatus.value == 1 || runningStatus.value == 2) {
    await triggerRobot()
    await new Promise((resolve) => setTimeout(resolve, 500))
    await triggerRobot()
  }
}

// 触发机器人（运行/停止）支持 单账号/批量智能操作
const triggerRobot = async (isBatch = false) => {
  if (!accountInfo.value) return

  // 1. 定义基础参数
  let baseUrl = '/config/'
  let actionMsg = ''
  const currentStatus = runningStatus.value

  // 2. 判断操作类型：启动 / 停止
  if (currentStatus == 0) {
    // 未运行 → 启动
    if (hasUnsavedChanges.value) await saveConfig()
    baseUrl += 'run'
    actionMsg = isBatch ? '一键启动' : '启动'
  } else if (currentStatus == 1 || currentStatus == 2) {
    // 运行中 → 停止
    baseUrl += 'stop'
    actionMsg = isBatch ? '一键停止' : '停止'
  } else {
    return
  }

  // 3. 筛选需要操作的用户ID（核心：智能跳过已处于目标状态的账号）
  let targetUserIds = []
  if (isBatch) {
    // 批量模式：根据操作类型过滤用户
    const allUsers = systemUser.value.otherUsers || []
    if (currentStatus == 0) {
      // 启动：只选 未运行(runStatus=0) 的用户
      targetUserIds = allUsers.filter((user) => user.runStatus === 0).map((user) => user.id)
    } else {
      // 停止：只选 运行中(runStatus=1/2) 的用户
      targetUserIds = allUsers
        .filter((user) => user.runStatus === 1 || user.runStatus === 2)
        .map((user) => user.id)
    }
    // 无需要操作的账号，直接提示
    if (targetUserIds.length === 0) {
      showNotify({
        type: 'primary',
        message: `所有账号已${actionMsg.replace('一键', '')}，无需重复操作！`,
        duration: 2000,
      })
      return
    }
  } else {
    // 单账号模式：只操作当前用户
    targetUserIds = [currentUserId.value]
  }

  // 4. 加载提示
  saveToast.value = showLoadingToast({
    duration: 0,
    forbidClick: true,
    message: `${actionMsg}中...`,
    loadingType: 'spinner',
    className: 'custom-loading-toast',
  })

  // 5. 循环调用单个接口执行操作
  let successNum = 0
  let failNum = 0
  for (const userId of targetUserIds) {
    if (!userId) continue
    const requestUrl = `${baseUrl}?userId=${userId}`
    try {
      const { code } = await request({ method: 'get', url: requestUrl })
      code === 200 ? successNum++ : failNum++
    } catch (error) {
      failNum++
    }
  }

  // 6. 结果提示 + 刷新状态
  try {
    showNotify({
      type: successNum > 0 ? 'success' : 'danger',
      message: `${actionMsg}完成：成功${successNum}个，失败${failNum}个`,
      duration: 2500,
      className: 'custom-notify',
    })
    await getConfig(baseUrl.includes('stop'))
  } finally {
    saveToast.value?.close()
  }
}

// 获取图标URL
const getBaseIconUrl = () => {
  if ([1, 2].includes(accountInfo.value.gameId)) {
    return 'https://static.fthformal.com/flower/flower_newWX/ver/257/resource/assets/h5icon/i'
  } else if (accountInfo.value.gameId === 3) {
    return 'https://static22.supermoon.fun/beach_wxRL/ver/2.1.9/1/resource/assets/h5icon/i'
  } else if (accountInfo.value.gameId === 4) {
    return 'https://cdn-fth5-release.zhen-u.com/client/r1.0.86/resource/assets/h5icon/i'
  }
  return ''
}

// 过滤方法
const filterSeed = () => {
  seedList.value = seedList.value.filter((flower) =>
    flower.text.toLowerCase().includes(searchSeed.value.toLowerCase()),
  )
}

const filterFriend = () => {
  friendList.value = friends.value.filter((friend) =>
    friend.text.toLowerCase().includes(searchFriend.value.toLowerCase()),
  )
}

// 处理用户切换
const handleUserChange = async (newUserId, restart = false) => {
  currentUserId.value = newUserId
  // 保存当前用户ID到localStorage
  localStorage.setItem('currentUserId', newUserId)

  // 重置记录的用户ID，强制重新获取配置
  lastUserId.value = null

  // 重新获取配置
  await getConfig(true)
  // 如果是启动状态，重启
  if (restart) {
    restartRobot()
  }
}

// 获取配置
const autoPlantArr = [
  '关闭',
  '自选',
  '补仓并且鲜花>=1级',
  '补仓并且鲜花>8级',
  '补仓并且鲜花>12级',
  '品质',
]

const getConfig = async (force = false) => {
  if (hasUnsavedChanges.value && !force) return
  let url = '/config/get'
  if (currentUserId.value) {
    url = url + '?userId=' + currentUserId.value
  }
  try {
    const { data, code } = await request({
      method: 'get',
      url,
    })

    if (code !== 200) {
      showNotify({ type: 'warning', message: '请先登陆游戏！' })
      return
    }
    if (lastUserId.value == null) {
      accountInfo.value = { ...data }
    } else {
      // 仅更新非配置部分的数据，保留用户的配置修改
      accountInfo.value = {
        ...accountInfo.value,
        ...data,
        config: accountInfo.value.config || data.config, // 保留当前配置，如果存在
      }
    }
    // 更新最后获取配置的用户ID
    lastUserId.value = currentUserId.value
    friends.value = (currentUser.value.gameUser.friends || []).map((item) => ({
      value: item.userId,
      text: item.townName,
    }))

    otherUsers.value = systemUser.value.otherUsers

    nextRunTime.value = currentUser.value.nextRunTime

    // 如果没有设置当前用户，且有其他用户，则设置为第一个用户
    if (!currentUserId.value && otherUsers.value?.length) {
      currentUserId.value = otherUsers.value[0].id
      localStorage.setItem('currentUserId', currentUserId.value)
    }

    plantText.value = autoPlantArr[config.value.autoPlant]

    // 初始化折叠状态
    initExpandStates()
    // 确保所有任务都在race.task中
    for (const taskOpt of taskOptions) {
      if (!config.value.race.tasks.some((t) => t.id === taskOpt.id)) {
        config.value.race.tasks.push({ id: taskOpt.id, status: 0 })
      }
    }

    // 确保所有hd17任务都在activity.hd17.tasks中
    for (const taskOpt of hd17Options) {
      if (!config.value.activity.hd17.tasks.some((t) => t.id === taskOpt.id)) {
        config.value.activity.hd17.tasks.push({ id: taskOpt.id, status: 0 })
      }
    }

    // 🔥 新增：拉取新配置后，同步基准状态 → 无修改时不会误判
    initialConfigState.value = cloneDeep(config.value)
    hasUnsavedChanges.value = false

    initExpandStates()
    updateChangeTracking()
  } catch (error) {
    showNotify({ type: 'danger', message: '网络错误，无法获取配置' })
  }
}

// 监听配置变化，更新种植文本
watch(
  [() => config.value.autoPlant],
  () => {
    if (config.value) {
      plantText.value = autoPlantArr[config.value.autoPlant]
    }
  },
  { immediate: true },
)

// 监听配置变化，更新修改跟踪
watch(
  () => config.value,
  () => {
    updateChangeTracking()
  },
  { deep: true },
)

// 监听用户切换，重新初始化折叠状态
watch(currentUserId, () => {
  initExpandStates()
})

// 【新增】监听点击事件，关闭更多菜单和用户菜单
const handleClickOutside = (event) => {
  if (moreMenuRef.value && !moreMenuRef.value.contains(event.target)) {
    showMoreMenu.value = false
  }
  // 不关闭用户菜单，因为用户菜单有自己的关闭方式
}

// 处理配置更新
const handleConfigUpdate = (newConfig) => {
  // 深拷贝新配置到现有配置对象
  Object.assign(accountInfo.value.config, newConfig)
}

// 处理展开状态更新
const handleExpandStateUpdate = (newExpandStates) => {
  expandStates.value = { ...newExpandStates }
}

// 初始化
onMounted(async () => {
  getConfig()
  getExchangeCode()

  // 创建定时器ID变量，以便后续清理
  let interval = null

  // 设置定时器，每20秒获取一次配置
  interval = setInterval(() => {
    // 否则正常获取配置
    getConfig()
  }, 20000)

  // 添加全局点击事件监听器
  document.addEventListener('click', handleClickOutside)

  // 清理定时器
  const cleanup = () => {
    if (interval) {
      clearInterval(interval)
    }
    document.removeEventListener('click', handleClickOutside)
  }
  window.addEventListener('beforeunload', cleanup)
  return () => {
    cleanup()
    window.removeEventListener('beforeunload', cleanup)
  }
})
</script>

<style scoped>
/* 全局样式重置和基础设置 */
.page-container {
  min-height: 100vh;
  max-width: 780px;
  background: linear-gradient(to bottom, #f8f9fa 0%, #e8f4f8 100%);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  position: relative;
  padding-bottom: 120px; /* 为底部导航栏预留空间 */
  margin: auto;
}

/* 【新增】顶部标题区域样式 */
.top-title-bar {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  padding: 10px 16px 10px;
  text-align: center;
  background-color: #fff;
  border-bottom: 1px solid #f5f5f5;
}

.app-title {
  margin: 0;
  font-size: 22px;
  font-weight: 600;
  color: #1f2937;
  letter-spacing: 1px;
}

.version-number {
  font-size: 14px;
  color: #9ca3af; /* 灰色调 */
  font-weight: normal;
  align-self: flex-end;
  margin-left: 5px; /* 增加左边距，使版本号离标题远一些 */
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
}

.status-card {
  max-height: 65px;
  padding: 12px;
  border-radius: 16px;
  border: 1px solid transparent;
  background-color: #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  gap: 12px;
}

.status-card:active {
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
}

.status-text {
  font-size: 14px;
  font-weight: 500;
  line-height: 1.4;
}

.user-card {
  background-color: #fff;
  border-color: rgba(24, 144, 255, 0.2);
}

.username-text {
  color: #ff6767;
  font-weight: 600;
}

.user-dropdown {
  flex: 1;
  margin-left: 4px;
  /* 屏蔽背景色 */
  --van-dropdown-menu-background: transparent !important;
  /* 屏蔽默认阴影 */
  --van-dropdown-menu-shadow: none !important;
}

.alt-type-dropdown {
  /* 屏蔽背景色 */
  --van-dropdown-menu-background: transparent !important;
  /* 屏蔽默认阴影 */
  --van-dropdown-menu-shadow: none !important;
}

.user-dropdown-item :deep(.van-dropdown-item__content) {
  font-size: 14px;
}

/* 配置容器 */
.config-wrapper {
  padding: 0 16px 30px;
  position: relative;
  z-index: 1;
}

.config-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 配置卡片通用样式 */
.config-card {
  background-color: #fff;
  border-radius: 20px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.config-card:active {
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.12); /* 增强阴影，保留点击反馈 */
}

.card-header {
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  border-bottom: 1px solid #f5f5f5;
  cursor: pointer;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  flex: 1;
}

.card-content {
  padding: 16px 20px;
}

.expand-icon {
  transition: transform 0.3s ease;
}

.rotate-180 {
  transform: rotate(180deg);
}

/* 主要开关卡片 */
.main-switch-card {
  border: 1px solid #e6f7ff;
  margin-bottom: 15px;
}

.main-switch-cell {
  background-color: transparent;
  padding: 0;
}

.main-switch {
  --van-switch-active-color: #1890ff;
  --van-switch-inactive-color: #d9d9d9;
}

/* 功能卡片样式 */
.feature-cell {
  background-color: transparent;
  padding: 8px 0;
  border-bottom: 1px solid #f5f5f5;
}

.feature-cell:last-child {
  border-bottom: none;
}

.feature-title {
  font-size: 15px;
  font-weight: 500;
  color: #1f2937;
}

.feature-dropdown {
  width: 160px;
  /* 屏蔽背景色 */
  --van-dropdown-menu-background: transparent !important;
  /* 屏蔽默认阴影 */
  --van-dropdown-menu-shadow: none !important;
}

.dropdown-item :deep(.van-dropdown-item__content) {
  font-size: 14px;
}

/* 种植配置样式 */
.plant-mode-cell {
  padding: 8px 0;
  border-bottom: 1px solid #f5f5f5;
}

.plant-selector {
  --van-field-label-width: 0;
  font-weight: 500;
}

.plant-periods-section {
  margin-top: 16px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #8c8c8c;
  margin-bottom: 6px;
}

/* 配置项行样式 */
.config-item-row {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f5f5f5;
}

.config-item-row:last-child {
  border-bottom: none;
}

.config-item-col {
  display: flex;
  flex-direction: column;
  margin-right: 8px;
}

.seed-col {
  flex: 2;
}

.time-col {
  flex: 1.5;
}

.alt-name-col {
  flex: 2;
}

.alt-type-col {
  flex: 1.8;
}

.friend-col {
  flex: 1.8;
}

.flower-col {
  flex: 1.8;
}

.count-col {
  flex: 1.5;
}

.trade-col {
  flex: 1.5;
}

.switch-col {
  flex: 1.2;
}

.action-col {
  flex: 0.8;
  display: flex;
  justify-content: center;
}

.config-item-label {
  font-size: 12px;
  color: #8c8c8c;
  margin-bottom: 4px;
}

.config-item-value {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  font-weight: 500;
  color: #1f2937;
}

.clickable {
  cursor: pointer;
  transition: color 0.2s ease;
}

.clickable:active {
  color: #1890ff;
}

.value-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.seed-icon {
  margin-left: 6px;
  width: 24px;
  height: 24px;
  border-radius: 4px;
}

.arrow-icon {
  color: #cccccc;
}

/* 按钮样式 */
.delete-button {
  --van-button-danger-color: #ff4d4f;
  --van-button-border-radius: 6px;
  padding: 0;
  width: 32px;
  height: 32px;
}

.add-button {
  --van-button-primary-color: #1890ff;
  --van-button-border-radius: 12px;
  color: white;
  margin-top: 12px;
  height: 44px;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.2);
}

/* 空状态样式 */
.empty-state {
  padding: 24px 0;
  display: flex;
  justify-content: center;
}

.empty-content :deep(.van-empty__image) {
  width: 80px;
  height: 80px;
}

.empty-content :deep(.van-empty__description) {
  font-size: 14px;
  color: #8c8c8c;
  margin-top: 8px;
}

/* 订单高级配置 */
.order-advanced-section {
  margin-top: 16px;
}

.advanced-setting-group {
  padding-left: 10px; /* 进一步缩进 */
}

.advanced-cell {
  padding: 12px 0;
  border-bottom: 1px solid #f5f5f5;
}

.advanced-cell:last-child {
  border-bottom: none;
}

.stepper-control {
  width: 180px;
}

/* 摸花配置样式 */
.steal-row {
  flex-wrap: wrap;
}

.steal-stepper {
  width: 100px;
}

/* 其他功能网格 */
.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 12px;
  margin-top: 8px;
}

.feature-item {
  display: flex;
  align-items: center;
  padding: 12px;
  background-color: #f8f9fa;
  border-radius: 12px;
  gap: 12px;
}

.feature-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background-color: rgba(24, 144, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.feature-info {
  flex: 1;
}

.feature-name {
  font-size: 14px;
  font-weight: 500;
  color: #1f2937;
  margin-bottom: 2px;
}

.feature-desc {
  font-size: 12px;
  color: #8c8c8c;
}

.mini-dropdown {
  /* 屏蔽背景色 */
  --van-dropdown-menu-background: transparent !important;
  /* 屏蔽默认阴影 */
  --van-dropdown-menu-shadow: none !important;
  width: 100px;
}

.mini-dropdown-item :deep(.van-dropdown-item__content) {
  font-size: 12px;
}

/* VIP3卡片样式 */
.vip3-card {
  background: linear-gradient(135deg, #fdf2f8 0%, #fef7fb 100%);
  border: 1px solid #fde2ef;
}

.vip3-header {
  background-color: rgba(250, 173, 20, 0.1);
  border-bottom-color: rgba(250, 173, 20, 0.2);
}

.vip3-title {
  color: #faad14;
}

.vip3-feature-cell {
  border-bottom: 1px solid #f5f5f5;
}

.vip3-feature-title {
  color: #faad14;
}

.resources-progress-section {
  margin-top: 16px;
}

.resource-item {
  margin-bottom: 12px;
}

.resource-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
}

.resource-name {
  font-size: 14px;
  font-weight: 500;
  color: #1f2937;
}

.resource-count {
  font-size: 12px;
  color: #8c8c8c;
}

.resource-progress {
  --van-progress-background-color: #f5f5f5;
  border-radius: 4px;
}

/* 非VIP用户样式 */
.non-vip-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.basic-steal-row {
  flex-wrap: wrap;
}

.upgrade-tip-card {
  background: linear-gradient(135deg, #fff7e6 0%, #fffbe6 100%);
  border: 1px solid #ffe58f;
  border-radius: 16px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.upgrade-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background-color: rgba(250, 173, 20, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.upgrade-content {
  flex: 1;
}

.upgrade-title {
  font-size: 15px;
  font-weight: 600;
  color: #faad14;
  margin-bottom: 4px;
}

.upgrade-desc {
  font-size: 12px;
  color: #8c8c8c;
  line-height: 1.4;
}

.upgrade-btn {
  --van-button-warning-color: #faad14;
  white-space: nowrap;
}

/* 弹出层样式 */
.custom-popup {
  border-radius: 20px 20px 0 0;
  padding: 0;
  overflow: hidden;
}

.popup-header {
  padding: 16px 20px;
  background-color: #fff;
  border-bottom: 1px solid #f5f5f5;
  display: flex;
  align-items: center;
}

.popup-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.search-field {
  margin: 16px 20px;
  --van-field-background-color: #f5f7fa;
  --van-field-border-radius: 12px;
}

.custom-time-picker {
  padding: 0 20px 20px;
}

.custom-picker {
  height: 300px;
  padding: 0 20px 20px;
}

/* 自定义加载提示和通知 */
:deep(.custom-loading-toast) {
  --van-toast-background-color: rgba(0, 0, 0, 0.8);
  --van-toast-text-color: #fff;
  border-radius: 12px;
  padding: 16px 20px;
}

:deep(.custom-notify) {
  --van-notify-border-radius: 8px;
  padding: 8px 16px;
}

/* 【新增】底部导航栏样式 */
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.nav-container {
  display: flex;
  justify-content: space-around;
  align-items: center;
  width: 100%;
  max-width: 780px;
  margin: 0 auto;
  padding: 10px 0px 5px;
  background-color: #fff;
  border-radius: 20px 20px 0 0;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
  position: relative;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  flex: 1;
  max-width: 80px;
}

.nav-item:hover {
  background-color: #f5f7fa;
}

.nav-center-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 83px;
  height: 80px;
  background-color: #fff;
  border-radius: 50%;
  box-shadow:
    0 4px 12px rgba(0, 0, 0, 0.15),
    0 0 0 4px #fff;
  cursor: pointer;
  position: absolute;
  top: -32px;
  left: 50%;
  transform: translateX(-50%);
  transition: all 0.2s ease;
  z-index: 1001;
}

.nav-center-item:hover {
  transform: translateX(-50%) scale(1.05);
  box-shadow:
    0 6px 16px rgba(0, 0, 0, 0.2),
    0 0 0 4px #fff;
}

.nav-center-item span {
  margin-top: 4px;
  font-size: 12px;
  font-weight: 500;
}

.nav-item span {
  margin-top: 4px;
  font-size: 12px;
  font-weight: 500;
}

.nav-center-item.disabled {
  cursor: not-allowed;
  pointer-events: none;
}

/* 【新增】用户导航项目样式 */
.user-nav-item {
  position: relative;
}

.user-status-text {
  display: block;
  font-size: 12px;
  font-weight: 500;
}

.username-badge {
  position: absolute;
  top: -6px;
  right: 8px;
  background-color: #1890ff;
  color: white;
  font-size: 10px;
  padding: 2px 4px;
  border-radius: 10px;
  min-width: 20px;
  text-align: center;
  transform: scale(0.9);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* 【新增】二级菜单样式 */
.more-menu {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  width: 160px;
  z-index: 1002;
  overflow: hidden;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 1px solid #f5f5f5;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-item:hover {
  background-color: #f5f7fa;
}

.menu-item span {
  margin-left: 8px;
  font-size: 14px;
  color: #333;
}

/* 【新增】用户菜单弹窗样式 */
.user-menu-popup {
  border-radius: 20px 20px 0 0 !important;
  overflow: hidden;
}

.user-menu-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #f5f5f5;
}

.user-menu-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.close-icon {
  cursor: pointer;
  color: #8c8c8c;
}

.user-info-section {
  display: flex;
  align-items: center;
  padding: 20px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #f5f5f5;
}

.user-avatar {
  margin-right: 16px;
}

.user-details {
  flex: 1;
}

.user-name {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
}

.user-email {
  font-size: 14px;
  color: #8c8c8c;
  margin-bottom: 4px;
}

.login-time {
  font-size: 12px;
  color: #8c8c8c;
}

.user-menu-actions {
  margin: 0;
  border-radius: 0;
}

.logout-cell {
  --van-cell-text-color: #ff4d4f;
  --van-cell-background-color: #fff8f8;
  margin-top: 8px;
  border-radius: 12px;
}

/* 【新增】品质选择按钮样式 */
.color-buttons-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
  justify-content: right;
}

.color-button {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 49px;
  height: 34px;
  border-radius: 5%;
  border: 2px solid transparent;
  background-color: transparent;
  cursor: pointer;
  font-weight: bold;
  font-size: 16px;
  color: #666;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.color-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 10%;
  z-index: -1;
  transition: all 0.3s ease;
}

.color-button.selected {
  transform: scale(1);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
}

.color-button.selected .color-text {
  color: white;
}

.color-button.color-1::before {
  background-color: #73b185;
}
.color-button.color-1 {
  color: #5a9e70;
}
.color-button.color-1.selected {
  color: white;
}

.color-button.color-2::before {
  background-color: #7c98b3;
}
.color-button.color-2 {
  color: #6b92b3;
}
.color-button.color-2.selected {
  color: white;
}

.color-button.color-3::before {
  background-color: #a896cc;
}
.color-button.color-3 {
  color: #a28fd0;
}
.color-button.color-3.selected {
  color: white;
}

.color-button.color-4::before {
  background-color: #f5b96e;
}
.color-button.color-4 {
  color: #ffb84d;
}
.color-button.color-4.selected {
  color: white;
}

.color-button.color-5::before {
  background-color: #e07187;
}
.color-button.color-5 {
  color: #e64c65;
}
.color-button.color-5.selected {
  color: white;
}

.color-text {
  position: relative;
  z-index: 1;
  font-weight: bold;
  font-size: 16px;
}

.color-selection-summary {
  margin-top: 12px;
  font-size: 14px;
  color: #8c8c8c;
  padding: 8px 12px;
  background-color: #fafafa;
  border-radius: 8px;
}

/* 品质种植相关样式 */
.quality-plant-section {
  margin-top: 16px;
}

.indent {
  position: relative !important;
  padding-left: 14px !important;
  margin-left: 4px !important;
}
:deep(.indent::before) {
  content: '' !important;
  position: absolute !important;
  left: 0 !important;
  top: 0 !important;
  height: 100% !important;
  width: 2px !important;

  background-image: repeating-linear-gradient(
    to bottom,
    #eaeaea 0px,
    #eaeaea 6px,
    transparent 6px,
    transparent 12px
  ) !important;

  -webkit-mask-image: linear-gradient(to bottom, black 60%, transparent 100%) !important;
  mask-image: linear-gradient(to bottom, black 60%, transparent 100%) !important;
}

/* 【新增】兑换码功能相关样式 */
.exchange-code-section {
  margin-top: 16px;
}

.exchange-code-input-container {
  display: flex;
  align-items: center;
  gap: 8px;
}

.exchange-code-input {
  flex: 1;
  --van-field-border-radius: 8px;
  --van-field-background-color: #f5f7fa;
}

/* 【新增】公会竞赛配置样式 */
.race-advanced-section {
  margin-left: 20px; /* 缩进 */
  margin-top: 16px;
}

.task-list {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.task-item {
  display: flex;
  align-items: center;
  background-color: #f8f9fa;
  border-radius: 12px;
  padding: 8px 16px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
  border: 1px solid #eaecef;
}

.task-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.task-item.disabled-drag {
  opacity: 0.7;
  cursor: not-allowed;
}

.task-priority {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3070ef, #a6bde3);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: bold;
  margin-right: 10px;
  flex-shrink: 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.task-priority.priority-disabled {
  background: linear-gradient(135deg, #b0b0b0, #d0d0d0);
  cursor: not-allowed;
}

.task-cell {
  flex: 1;
  padding: 0;
  margin: 0;
  background: none;
  border: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.task-cell-title {
  font-size: 14px;
  color: #374151;
  margin: 0;
  flex: 1;
}

.ghost {
  opacity: 0.5;
  background: #c8ebfb;
}

.chosen {
  border: 2px solid #409eff;
}

/* 花绣时光任务列表样式 */
.hd17-task-list {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.hd17-task-item {
  display: flex;
  align-items: center;
  background-color: #f8f9fa;
  border-radius: 12px;
  padding: 8px 16px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
  border: 1px solid #eaecef;
}

.hd17-task-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

/* 响应式适配 */
@media (max-width: 375px) {
  .status-grid {
    grid-template-columns: 1fr 1fr;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }

  .config-item-row {
    align-items: flex-start;
    gap: 8px;
  }

  .config-item-col {
    width: 100%;
    margin-right: 0;
  }

  .action-col {
    align-self: flex-end;
  }

  .nav-container {
    padding: 12px 8px;
  }

  .nav-item {
    max-width: 70px;
  }

  .username-badge {
    font-size: 9px;
    padding: 1px 3px;
  }

  .color-button {
    width: 42px;
    height: 42px;
    font-size: 14px;
  }

  .exchange-code-input-container {
    flex-direction: column;
    align-items: stretch;
  }

  .task-priority {
    width: 28px;
    height: 28px;
    font-size: 12px;
  }
  .nav-center-item {
    width: 76px;
    height: 76px;
    top: -36px;
  }
}

/* 动画效果 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.config-card {
  animation: fadeIn 0.3s ease-out;
}

.config-card:nth-child(1) {
  animation-delay: 0.05s;
}
.config-card:nth-child(2) {
  animation-delay: 0.1s;
}
.config-card:nth-child(3) {
  animation-delay: 0.15s;
}
.config-card:nth-child(4) {
  animation-delay: 0.2s;
}
.config-card:nth-child(5) {
  animation-delay: 0.25s;
}

:deep(.stepper-control) {
  width: auto;
}

/* 🔥 最终版：无空白磨砂玻璃粘性置顶 */
.fixed-top-card {
  position: sticky;
  /* 核心：紧贴顶部，0间距，彻底去掉空白 */
  top: 0;
  width: 100%;
  max-width: 780px;
  margin: 0 auto;
  /* 核心：取消内缩留白，铺满容器 */
  padding: 10px 16px;
  z-index: 10;
  transition: all 0.3s ease;

  /* 磨砂玻璃核心样式 */
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  /* 只留底部圆角，顶部无缝贴合，不留白 */
  border-radius: 0 0 18px 18px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

/* 配置容器：恢复默认，无顶部间距 */
.config-wrapper {
  padding: 0 16px 30px;
  position: relative;
  z-index: 1;
}

.page-container {
  min-height: 100vh;
  max-width: 780px;
  /* 微调：超淡温柔粉色渐变，微微带粉，柔和不刺眼 */
  background: linear-gradient(to bottom, #fefafc 0%, #f9f0f7 100%);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  position: relative;
  padding-bottom: 120px;
  margin: auto;
  /* 核心：去掉顶部默认留白 */
  padding-top: 0 !important;
}

/* 用户卡片：完全融入磨砂栏，无多余间距 */
.user-status-card {
  background: transparent !important;
  box-shadow: none !important;
  margin: 0;
}
</style>
