<template>
  <div class="private-conversation">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>私聊会话管理</span>
        </div>
      </template>

      <!-- 搜索表单 -->
      <neumorphic-background class="search-form-container">
        <el-form :model="searchForm" :inline="true" class="search-form">
          <el-form-item label="用户1">
            <el-select
              v-model="searchForm.uid1"
              placeholder="请选择用户1"
              clearable
              filterable
              :loading="userLoading"
              style="width: 200px"
            >
              <el-option
                v-for="id in filteredSearchUser1Options"
                :key="id"
                :label="getUserName(id)"
                :value="id"
              >
                <div class="user-option">
                  <el-avatar :size="24">
                    {{ getUserName(id)?.charAt(0) }}
                  </el-avatar>
                  <span>{{ getUserName(id) }}</span>
                </div>
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="用户2">
            <el-select
              v-model="searchForm.uid2"
              placeholder="请选择用户2"
              clearable
              filterable
              :loading="userLoading"
              style="width: 200px"
            >
              <el-option
                v-for="id in filteredSearchUser2Options"
                :key="id"
                :label="getUserName(id)"
                :value="id"
              >
                <div class="user-option">
                  <el-avatar :size="24">
                    {{ getUserName(id)?.charAt(0) }}
                  </el-avatar>
                  <span>{{ getUserName(id) }}</span>
                </div>
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="房间状态">
            <el-select v-model="searchForm.status" placeholder="请选择状态" clearable style="width: 200px">
              <el-option label="正常" :value="0" />
              <el-option label="禁用" :value="1" />
            </el-select>
          </el-form-item>
          <el-form-item label="创建时间">
            <el-date-picker
              v-model="searchForm.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="YYYY-MM-DD"
              style="width: 300px"
            />
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
          创建私聊
        </neumorphic-button>
        <neumorphic-button type="danger" :disabled="selectedConversations.length === 0" @click="handleBatchDelete">
          <el-icon><Delete /></el-icon>
          批量删除
        </neumorphic-button>
      </div>

      <!-- 私聊会话表格 -->
      <el-table 
        :data="conversations" 
        style="width: 100%" 
        @selection-change="handleSelectionChange" 
        v-loading="loading"
        height="400"
        :max-height="400"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column type="index" label="序号" width="80" align="center" />
        <el-table-column label="用户1" width="180" align="center">
          <template #default="scope">
            <div class="user-info">
              <span class="username">{{ scope.row.user1Name }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="用户2" width="180" align="center">
          <template #default="scope">
            <div class="user-info">
              <span class="username">{{ scope.row.user2Name }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="roomKey" label="房间Key" width="100" align="center" />
        <el-table-column prop="status" label="状态" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.status === 0 ? 'success' : 'danger'">
              {{ scope.row.status === 0 ? '正常' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" sortable width="180" align="center">
          <template #default="scope">
            {{ formatDateTime(scope.row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="updateTime" label="更新时间" sortable width="180" align="center">
          <template #default="scope">
            {{ formatDateTime(scope.row.updateTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" align="center">
          <template #default="scope">
            <neumorphic-button 
              :type="scope.row.status === 0 ? 'orange' : 'green'" 
              size="small" 
              @click="handleToggleStatus(scope.row)"
            >
              {{ scope.row.status === 0 ? '禁用' : '启用' }}
            </neumorphic-button>
            <neumorphic-button type="danger" size="small" @click="handleDelete(scope.row)">
              删除
            </neumorphic-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[7,10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 添加私聊对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px" @close="resetEditForm">
      <el-form ref="editFormRef" :model="editForm" label-width="100px">
        <el-form-item label="用户1" prop="uid1">
          <el-select
            v-model="editForm.uid1"
            placeholder="请选择用户1"
            style="width: 100%"
            filterable
            :loading="userLoading"
          >
            <el-option
              v-for="id in filteredCreateUser1Options"
              :key="id"
              :label="getUserName(id)"
              :value="id"
            >
              <div class="user-option">
                <el-avatar :size="24">
                  {{ getUserName(id)?.charAt(0) }}
                </el-avatar>
                <span>{{ getUserName(id) }}</span>
              </div>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="用户2" prop="uid2">
          <el-select
            v-model="editForm.uid2"
            placeholder="请选择用户2"
            style="width: 100%"
            filterable
            :loading="userLoading"
          >
            <el-option
              v-for="id in filteredCreateUser2Options"
              :key="id"
              :label="getUserName(id)"
              :value="id"
            >
              <div class="user-option">
                <el-avatar :size="24">
                  {{ getUserName(id)?.charAt(0) }}
                </el-avatar>
                <span>{{ getUserName(id) }}</span>
              </div>
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <neumorphic-button @click="dialogVisible = false">取消</neumorphic-button>
          <neumorphic-button @click="resetEditForm">重置</neumorphic-button>
          <neumorphic-button type="primary" @click="handleSubmit">确定</neumorphic-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Delete } from '@element-plus/icons-vue'
import NeumorphicButton from '@/components/NeumorphicButton.vue'
import NeumorphicBackground from '@/components/NeumorphicBackground.vue'
import { formatDateTime } from '@/utils/date'
import { privateRoomListService, privateRoomAddService, convertStatusService, privateRoomDeleteService, privateRoomBatchDeleteService } from '@/api/room'
import { userListAlluserService } from '@/api/user'

// 响应式数据
const loading = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('创建私聊')
const selectedConversations = ref([])
const editFormRef = ref()

// 分页参数
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 搜索表单
const searchForm = reactive({
  uid1: '',
  uid2: '',
  status: '',
  dateRange: []
})

// 原始数据
const originalConversations = ref([])

// 过滤后的数据
const conversations = computed(() => {
  let filteredData = [...originalConversations.value]
  
  // 根据时间区间过滤
  if (searchForm.dateRange && searchForm.dateRange.length === 2) {
    const startDate = new Date(searchForm.dateRange[0]).getTime()
    const endDate = new Date(searchForm.dateRange[1]).getTime()
    filteredData = filteredData.filter(item => {
      const createTime = new Date(item.createTime).getTime()
      return createTime >= startDate && createTime <= endDate
    })
  }
  
  return filteredData
})

// 编辑表单数据
const editForm = reactive({
  uid1: '',
  uid2: ''
})

// 用户映射表
const userMap = ref(new Map())
const userLoading = ref(false)

// 获取所有用户并构建映射表
const fetchAllUsers = async () => {
  try {
    userLoading.value = true
    const res = await userListAlluserService()
    if (res.code === 200) {
      // 构建用户ID到用户名的映射表
      userMap.value = new Map(res.data.map(user => [user.id, user.username]))
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

// 获取用户名
const getUserName = (userId) => {
  return userMap.value.get(userId) || '未知用户'
}

// 获取所有用户ID列表
const userIds = computed(() => {
  return Array.from(userMap.value.keys())
})

// 过滤后的搜索用户1列表
const filteredSearchUser1Options = computed(() => {
  return userIds.value.filter(id => id !== searchForm.uid2)
})

// 过滤后的搜索用户2列表
const filteredSearchUser2Options = computed(() => {
  return userIds.value.filter(id => id !== searchForm.uid1)
})

// 过滤后的创建用户1列表
const filteredCreateUser1Options = computed(() => {
  return userIds.value.filter(id => id !== editForm.uid2)
})

// 过滤后的创建用户2列表
const filteredCreateUser2Options = computed(() => {
  return userIds.value.filter(id => id !== editForm.uid1)
})

// 获取私聊会话列表
const fetchConversationList = async () => {
  try {
    loading.value = true
    const params = {
      page: pagination.currentPage,
      pageSize: pagination.pageSize,
      uid1: searchForm.uid1,
      uid2: searchForm.uid2,
      status: searchForm.status
    }
    const res = await privateRoomListService(params)
    if (res.code === 200) {
      originalConversations.value = res.data.records.map(item => ({
        id: item.id,
        roomKey: item.roomKey,
        roomId: item.roomId,
        status: item.status,
        createTime: item.createTime,
        updateTime: item.updateTime,
        user1Name: getUserName(item.uid1),
        user2Name: getUserName(item.uid2)
      }))
      pagination.total = res.data.total
      pagination.currentPage = res.data.current
      pagination.pageSize = res.data.size
    } else {
      ElMessage.error(res.msg || '获取私聊会话列表失败')
    }
  } catch (error) {
    ElMessage.error('获取私聊会话列表失败')
    console.error('获取私聊会话列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.currentPage = 1
  fetchConversationList()
}

// 重置搜索
const handleReset = () => {
  searchForm.uid1 = ''
  searchForm.uid2 = ''
  searchForm.status = ''
  searchForm.dateRange = []
  handleSearch()
}

// 表格选择变化
const handleSelectionChange = (selection) => {
  selectedConversations.value = selection
}

// 添加私聊会话
const handleAdd = () => {
  dialogTitle.value = '创建私聊'
  resetEditForm()
  dialogVisible.value = true
}

// 重置编辑表单
const resetEditForm = () => {
  editForm.uid1 = ''
  editForm.uid2 = ''
  if (editFormRef.value) {
    editFormRef.value.resetFields()
  }
}

// 删除私聊会话
const handleDelete = (row) => {
  console.log(row.id)
  ElMessageBox.confirm('确定要删除该私聊会话吗？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await privateRoomDeleteService(row.id)
      ElMessage.success('删除成功')
      fetchConversationList()
    } catch (error) {
      ElMessage.error('删除失败')
    }
  })
}

// 批量删除
const handleBatchDelete = () => {
  if (selectedConversations.value.length === 0) {
    ElMessage.warning('请选择要删除的私聊会话')
    return
  }
  ElMessageBox.confirm(`确定要删除选中的 ${selectedConversations.value.length} 个私聊会话吗？`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const ids = selectedConversations.value.map(item =>item.roomId)
      
      await privateRoomBatchDeleteService(ids)
      ElMessage.success('批量删除成功')
      fetchConversationList()
    } catch (error) {
      ElMessage.error('批量删除失败')
    }
  })
}

// 提交表单
const handleSubmit = async () => {
  try {
    const data = {
      uid1: editForm.uid1,
      uid2: editForm.uid2
    }
    await privateRoomAddService(data)
    ElMessage.success('创建成功')
    dialogVisible.value = false
    resetEditForm()
    fetchConversationList()
  } catch (error) {
    ElMessage.error('创建失败')
  }
}

// 分页大小改变
const handleSizeChange = (val) => {
  pagination.pageSize = val
  fetchConversationList()
}

// 页码改变
const handleCurrentChange = (val) => {
  pagination.currentPage = val
  fetchConversationList()
}

// 禁用/启用会话
const handleToggleStatus = async (row) => {
  try {
    await convertStatusService({
      roomId: row.roomId,
      status: row.status === 0 ? 1 : 0
    })
    ElMessage.success(row.status === 0 ? '禁用成功' : '启用成功')
    fetchConversationList()
  } catch (error) {
    ElMessage.error(row.status === 0 ? '禁用失败' : '启用失败')
  }
}

onMounted(async () => {
  await fetchAllUsers() // 获取所有用户并构建映射表
  await fetchConversationList()
})
</script>

<style scoped>
.private-conversation {
  max-width: 1800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
}

.box-card {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-form-container {
  margin-bottom: 20px;
  padding: 20px;
  border-radius: 8px;
}

.search-form {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.toolbar {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
}

.pagination {
  margin: 16px 20px 10px;
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

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.username {
  font-size: 14px;
  color: #333;
}

.user-option {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-option .el-avatar {
  background-color: #f0f0f0;
  color: #666;
}

:deep(.el-table) {
  border-radius: 8px;
  overflow: hidden;
  font-size: 13px;
  margin: 0 20px;
}

:deep(.el-table__header-wrapper) {
  background: #fafafa;
}
</style> 