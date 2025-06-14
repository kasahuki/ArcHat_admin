<template>
  <div class="friendship-management">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>好友关系管理</span>
        </div>
      </template>
      
      <!-- 搜索表单 -->
      <neumorphic-background class="search-form-container">
        <el-form :model="searchForm" :inline="true" class="search-form">
          <el-form-item label="状态" style="width:15%;">
            <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
              <el-option
                v-for="option in statusOptions"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item>
            <neumorphic-button type="primary" @click="handleSearch">搜索</neumorphic-button>
            <neumorphic-button type="danger" @click="handleReset">重置</neumorphic-button>
          </el-form-item>
        </el-form>
      </neumorphic-background>

      <!-- 操作按钮 -->
      <div class="toolbar">
        <neumorphic-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          添加好友关系
        </neumorphic-button>
      </div>

      <!-- 好友关系表格 -->
      <el-table
        :data="friendships"
        style="width: 100%"
        v-loading="loading"
        height="500"
        :max-height="500"
      >
        <el-table-column label="序号" width="80">
          <template #default="scope">
            {{ scope.$index + 1 }}
          </template>
        </el-table-column>
        <el-table-column label="用户" min-width="200">
          <template #default="scope">
            <div class="user-info" v-if="scope.row.userId">
              <el-avatar :size="32">
                {{ getUserName(scope.row.userId)?.charAt(0) || '?' }}
              </el-avatar>
              <span class="user-name">{{ getUserName(scope.row.userId) }}</span>
            </div>
            <span v-else>未知用户</span>
          </template>
        </el-table-column>
        <el-table-column label="好友" min-width="200">
          <template #default="scope">
            <div class="user-info" v-if="scope.row.friendId">
              <el-avatar :size="32">
                {{ getUserName(scope.row.friendId)?.charAt(0) || '?' }}
              </el-avatar>
              <span class="user-name">{{ getUserName(scope.row.friendId) }}</span>
            </div>
            <span v-else>未知用户</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态">
          <template #default="scope">
            <el-tag :type="getStatusTagType(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" sortable width="180">
          <template #default="scope">
            {{ new Date(scope.row.createTime).toLocaleString('zh-CN') }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="scope">
            <el-button
              type="danger"
              size="small"
              @click="handleDelete(scope.row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[7,10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 添加好友关系对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="500px"
      @close="resetForm"
    >
      <el-form
        ref="friendshipFormRef"
        :model="friendshipForm"
        :rules="formRules"
        label-width="80px"
      >
        <el-form-item label="用户" prop="userId">
          <div class="select-with-search">
            <el-select
              v-model="friendshipForm.userId"
              placeholder="请选择用户"
              style="width: 100%"
              filterable
              :loading="userLoading"
              :filter-method="filterUsers"
            >
              <el-option
                v-for="user in filteredUsers"
                :key="user.id"
                :label="user.name"
                :value="user.id"
              >
                <div class="user-option">
                  <el-avatar :size="24">
                    {{ user.name?.charAt(0) || '?' }}
                  </el-avatar>
                  <span>{{ user.name || '未知用户' }}</span>
                </div>
              </el-option>
            </el-select>
            <el-input
              v-model="userSearchKeyword"
              placeholder="搜索用户"
              class="search-input"
              clearable
              @input="handleUserSearch"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </div>
        </el-form-item>
        <el-form-item label="好友" prop="friendId">
          <div class="select-with-search">
            <el-select
              v-model="friendshipForm.friendId"
              placeholder="请选择好友"
              style="width: 100%"
              filterable
              :loading="userLoading"
              :filter-method="filterFriends"
            >
              <el-option
                v-for="user in filteredFriendOptions"
                :key="user.id"
                :label="user.name"
                :value="user.id"
              >
                <div class="user-option">
                  <el-avatar :size="24">
                    {{ user.name?.charAt(0) || '?' }}
                  </el-avatar>
                  <span>{{ user.name || '未知用户' }}</span>
                </div>
              </el-option>
            </el-select>
            <el-input
              v-model="friendSearchKeyword"
              placeholder="搜索好友"
              class="search-input"
              clearable
              @input="handleFriendSearch"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </div>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select
            v-model="friendshipForm.status"
            placeholder="请选择状态"
            style="width: 100%"
          >
            <el-option
              v-for="option in statusOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Delete, Search } from '@element-plus/icons-vue'
import { friendListService, friendAddService, friendDeleteService } from '@/api/friend'
import { userListService, userListAlluserService } from '@/api/user'
import NeumorphicButton from '@/components/NeumorphicButton.vue'
import NeumorphicBackground from '@/components/NeumorphicBackground.vue'

// 响应式数据
const loading = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('添加好友关系')
const currentPage = ref(1)
const pageSize = ref(7)
const friendshipFormRef = ref()

// 搜索表单
const searchForm = reactive({
  status: '',
  page: 1,
  pageSize: 7
})

// 好友关系表单
const friendshipForm = reactive({
  userId: '',    // 存储用户ID
  friendId: '',  // 存储好友ID
  status: 0
})

// 表单验证规则
const formRules = {
  userId: [
    { required: true, message: '请选择用户', trigger: 'change' }
  ],
  friendId: [
    { required: true, message: '请选择好友', trigger: 'change' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ]
}

// 好友关系列表数据
const friendships = ref([])
const total = ref(0)

// 状态选项
const statusOptions = [
  { label: '待验证', value: 0 },
  { label: '好友', value: 1 },
  { label: '已拒绝', value: 2 }
]

// 用户列表数据
const users = ref([])
const userLoading = ref(false)
const userKeyword = ref('')
const userMap = ref(new Map()) // 用户ID到用户信息的映射表

// 搜索关键词
const userSearchKeyword = ref('')
const friendSearchKeyword = ref('')

// 获取好友关系列表
const fetchFriendList = async () => {
  try {
    loading.value = true
    const params = {
      status: searchForm.status === '' ? undefined : searchForm.status,
      page: currentPage.value,
      pageSize: pageSize.value
    }
    const res = await friendListService(params)
    if (res.code === 200) {
      friendships.value = res.data.records
      total.value = res.data.total
      console.log('好友关系列表:', friendships.value) // 添加日志
    } else {
      ElMessage.error(res.msg || '获取好友关系列表失败')
    }
  } catch (error) {
    ElMessage.error('获取好友关系列表失败')
    console.error('获取好友关系列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  fetchFriendList()
}

// 重置搜索
const handleReset = () => {
  searchForm.status = ''
  currentPage.value = 1
  fetchFriendList()
}

// 添加好友关系
const handleAdd = () => {
  dialogTitle.value = '添加好友关系'
  dialogVisible.value = true
  resetForm()
}

// 删除好友关系
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除该好友关系吗？`,
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    
    const res = await friendDeleteService(row.id)
    if (res.code === 200) {
      ElMessage.success('删除成功')
      fetchFriendList() // 重新获取列表
    } else {
      ElMessage.error(res.msg || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
      console.error('删除好友关系失败:', error)
    } else {
      ElMessage.info('已取消删除')
    }
  }
}

// 获取所有用户列表
const fetchAllUsers = async () => {
  try {
    userLoading.value = true
    const res = await userListAlluserService()
    if (res.code === 200) {
      users.value = res.data.map(user => ({
        id: user.id,
        name: user.username,
        avatar: user.avatar
      }))
      // 构建用户映射表
      userMap.value = new Map(users.value.map(user => [user.id, user]))
      console.log('用户列表:', users.value) // 添加日志
    } else {
      ElMessage.error(res.msg || '获取用户列表失败')
    }
  } catch (error) {
    ElMessage.error('获取用户列表失败')
    console.error('获取用户列表失败:', error)
  } finally {
    userLoading.value = false
  }
}

// 获取用户名称
const getUserName = (userId) => {
  return userMap.value.get(userId)?.name 
}

// 过滤后的用户列表
const filteredUsers = computed(() => {
  if (!userSearchKeyword.value) return users.value
  return users.value.filter(user => 
    user.name.toLowerCase().includes(userSearchKeyword.value.toLowerCase())
  )
})

// 过滤后的好友列表
const filteredFriendOptions = computed(() => {
  let filtered = users.value.filter(user => user.id !== friendshipForm.userId)
  if (friendSearchKeyword.value) {
    filtered = filtered.filter(user => 
      user.name.toLowerCase().includes(friendSearchKeyword.value.toLowerCase())
    )
  }
  return filtered
})

// 处理用户搜索
const handleUserSearch = (value) => {
  userSearchKeyword.value = value
}

// 处理好友搜索
const handleFriendSearch = (value) => {
  friendSearchKeyword.value = value
}

// 过滤用户
const filterUsers = (query) => {
  if (query) {
    userSearchKeyword.value = query
  }
}

// 过滤好友
const filterFriends = (query) => {
  if (query) {
    friendSearchKeyword.value = query
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!friendshipFormRef.value) return
  
  try {
    await friendshipFormRef.value.validate()
    
    if (friendshipForm.userId === friendshipForm.friendId) {
      ElMessage.error('不能选择相同的用户')
      return
    }
    
    const res = await friendAddService({
      userId: friendshipForm.userId,
      friendId: friendshipForm.friendId,
      status: friendshipForm.status
    })
    
    if (res.code === 200) {
      ElMessage.success('添加成功')
      dialogVisible.value = false
      resetForm()
      fetchFriendList() // 重新获取列表
    } else {
      ElMessage.error(res.msg || '添加失败')
    }
  } catch (error) {
    ElMessage.error('请检查表单输入')
    console.error('提交表单失败:', error)
  }
}

// 重置表单
const resetForm = () => {
  friendshipForm.userId = ''
  friendshipForm.friendId = ''
  friendshipForm.status = 0
  userKeyword.value = ''
  
  if (friendshipFormRef.value) {
    friendshipFormRef.value.clearValidate()
  }
}

// 分页大小改变
const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
  fetchFriendList()
}

// 页码改变
const handleCurrentChange = (page) => {
  currentPage.value = page
  fetchFriendList()
}

// 获取状态文本
const getStatusText = (status) => {
  const option = statusOptions.find(opt => opt.value === status)
  return option ? option.label : '未知'
}

// 获取状态标签类型
const getStatusTagType = (status) => {
  switch (status) {
    case 0:
      return 'warning'
    case 1:
      return 'success'
    case 2:
      return 'danger'
    default:
      return 'info'
  }
}

onMounted(() => {
  fetchFriendList()
  fetchAllUsers()
})
</script>

<style scoped>
.friendship-management {
  max-width: 1800px;
  margin: 0 auto;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.box-card {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  padding: 12px 20px;
  border-bottom: 1px solid #f0f0f0;
}

.search-form {
  margin: 0;
  padding: 0;
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.search-form-container {
  margin: 16px 20px;
}

.search-form :deep(.el-form-item) {
  margin-bottom: 0;
  display: flex; /* 确保表单项是 flex 容器 */
  align-items: center; /* 确保表单项内部元素垂直居中 */
}

.search-form :deep(.el-form-item__label) {
  margin-bottom: 0;
  line-height: 32px; /* 与输入框高度对齐 */
  font-weight: 500;
  color: #1a1a1a;
}

.search-form :deep(.el-select) {
  width: 100%;
}

/* 为输入框添加内嵌样式 */
.search-form :deep(.el-input__wrapper) {
  background: #f5f5f5;
  box-shadow: inset 2px 2px 4px #d9d9d9,
              inset -2px -2px 4px #ffffff;
  border: none;
  border-radius: 8px;
}

.toolbar {
  margin: 0 20px 16px;
  display: flex;
  gap: 8px;
}

:deep(.el-table) {
  border-radius: 8px;
  overflow: hidden;
  font-size: 13px;
  flex: 1;
  margin: 0 20px;
}

:deep(.el-table__header-wrapper) {
  background: #fafafa;
}

:deep(.el-table th) {
  background: #fafafa;
  font-weight: 600;
  color: #1a1a1a;
  font-size: 13px;
  padding: 12px 0;
}

:deep(.el-table td) {
  padding: 12px 0;
  color: #4a4a4a;
}

:deep(.el-table tr:hover > td) {
  background: #f5f5f5;
}

:deep(.el-tag) {
  border-radius: 4px;
  padding: 2px 8px;
  font-size: 12px;
  font-weight: 500;
  border: none;
}

:deep(.el-tag--success) {
  background: #ecfdf5;
  color: #059669;
}

:deep(.el-tag--warning) {
  background: #fffbeb;
  color: #d97706;
}

:deep(.el-tag--info) {
  background: #eff6ff;
  color: #2563eb;
}

:deep(.el-tag--danger) {
  background: #fef2f2;
  color: #dc2626;
}

.pagination {
  margin: 16px 20px 50px;
  padding: 16px 0;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  border-top: 1px solid #f0f0f0;
  position: relative;
  z-index: 1;
  background: #fff;
}

:deep(.el-pagination) {
  --el-pagination-button-bg-color: transparent;
  --el-pagination-hover-color: #0066cc;
  font-size: 13px;
  padding: 0;
}

:deep(.el-pagination .el-pagination__total) {
  margin-right: 16px;
  color: #1a1a1a;
  font-weight: 500;
}

:deep(.el-pagination .el-pagination__sizes) {
  margin-right: 16px;
}

:deep(.el-pagination .el-pagination__jump) {
  margin-left: 16px;
}

:deep(.el-pagination .btn-prev),
:deep(.el-pagination .btn-next) {
  background: #f5f5f5;
  border: 1px solid #e4e7ed;
  color: #606266;
  border-radius: 4px;
  padding: 0 12px;
  height: 32px;
  line-height: 32px;
  transition: all 0.3s;
}

:deep(.el-pagination .btn-prev:hover),
:deep(.el-pagination .btn-next:hover) {
  color: #0066cc;
  border-color: #0066cc;
  background: #ecf5ff;
}

:deep(.el-pagination .el-pager li) {
  background: #f5f5f5;
  border: 1px solid #e4e7ed;
  color: #606266;
  border-radius: 4px;
  padding: 0 12px;
  height: 32px;
  line-height: 32px;
  transition: all 0.3s;
  margin: 0 4px;
}

:deep(.el-pagination .el-pager li.active) {
  background: #0066cc;
  color: #fff;
  border-color: #0066cc;
  font-weight: 600;
}

:deep(.el-pagination .el-pager li:hover) {
  color: #0066cc;
  border-color: #0066cc;
  background: #ecf5ff;
}

:deep(.el-pagination .el-select .el-input) {
  width: 100px;
}

:deep(.el-pagination .el-select .el-input__wrapper) {
  background: #f5f5f5;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 0 8px;
}

:deep(.el-pagination .el-select .el-input__wrapper:hover) {
  border-color: #0066cc;
}

:deep(.el-pagination .el-pagination__jump .el-input__wrapper) {
  background: #f5f5f5;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 0 8px;
  width: 50px;
}

:deep(.el-pagination .el-pagination__jump .el-input__wrapper:hover) {
  border-color: #0066cc;
}

:deep(.el-dialog) {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

:deep(.el-dialog__header) {
  margin: 0;
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
}

:deep(.el-dialog__title) {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
}

:deep(.el-dialog__body) {
  padding: 20px;
}

:deep(.el-dialog__footer) {
  padding: 12px 20px;
  border-top: 1px solid #f0f0f0;
}

.dialog-footer {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

:deep(.el-table .cell) {
  display: flex;
  gap: 8px;
  justify-content: flex-start;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: flex-start;
  padding-left: 16px;
}

.user-name {
  font-size: 13px;
  color: #1a1a1a;
  line-height: 1;
}

.user-option {
  display: flex;
  align-items: center;
  gap: 8px;
}

.select-with-search {
  display: flex;
  gap: 8px;
  align-items: center;
}

.select-with-search :deep(.el-select) {
  flex: 1;
}

.search-input {
  width: 200px;
}

.search-input :deep(.el-input__wrapper) {
  background: #f5f5f5;
  box-shadow: inset 2px 2px 4px #d9d9d9,
              inset -2px -2px 4px #ffffff;
  border: none;
  border-radius: 8px;
}

@media (max-width: 768px) {
  .friendship-management {
    padding: 12px;
  }

  .search-form-container {
    padding: 12px;
  }

  .toolbar {
    flex-wrap: wrap;
  }
}
</style> 