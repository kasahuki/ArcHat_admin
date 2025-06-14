<template>
  <div class="user-management">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>用户管理</span>
        </div>
      </template>

      <!-- 搜索表单 -->
      <neumorphic-background class="search-form-container">
        <el-form :model="searchForm" :inline="true" class="search-form">
          <el-form-item label="用户名称">
            <el-input v-model="searchForm.keyword" placeholder="请输入用户名称" clearable style="width: 200px" />
          </el-form-item>
          <el-form-item label="经验值范围">
            <el-input v-model="searchForm.exepMin" placeholder="最小值" type="number" style="width: 120px" />
            <span style="margin: 0 10px">-</span>
            <el-input v-model="searchForm.exepMax" placeholder="最大值" type="number" style="width: 120px" />
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
          添加用户
        </neumorphic-button>
        <neumorphic-button type="danger" :disabled="selectedUsers.length === 0" @click="handleBatchDelete">
          <el-icon><Delete /></el-icon>
          批量删除
        </neumorphic-button>
      </div>

      <!-- 用户表格 -->
      <el-table :data="filteredUsers" style="width: 100%" @selection-change="handleSelectionChange" v-loading="loading" height="500" :max-height="500">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="头像" width="80">
          <template #default="scope">
            <el-avatar :src="scope.row.avatar" :size="40">
              {{ scope.row.username.charAt(0) }}
            </el-avatar>
          </template>
        </el-table-column>
        <el-table-column prop="username" label="用户名称" />
        <el-table-column prop="password" label="密码" width="120">
          <template #default>
            <span>{{ '********' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="exep" label="经验值" sortable>
          <template #default="scope">
            <el-tag :type="getExperienceTagType(scope.row.exep)">
              {{ scope.row.exep }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态">
          <template #default="scope">
            <el-tag :type="scope.row.status ? 'success' : 'danger'">
              {{ scope.row.status ? '在线' : '离线' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" sortable>
          <template #default="scope">
            {{ formatDateTime(scope.row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180">
          <template #default="scope">
            <neumorphic-button type="primary" size="small" @click="handleEdit(scope.row)">
              编辑
            </neumorphic-button>
            <neumorphic-button type="danger" size="small" @click="handleDelete(scope.row)">
              删除
            </neumorphic-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination v-model:current-page="pagination.currentPage" v-model:page-size="pagination.pageSize"
          :page-sizes="[7,10, 20, 50, 100]" :total="pagination.total" layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange" @current-change="handleCurrentChange" />
      </div>
    </el-card>

    <!-- 添加/编辑用户对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px" @close="resetForm">
      <el-form ref="userFormRef" :model="userForm" :rules="formRules" label-width="80px">
        <el-form-item label="用户名称" prop="username">
          <el-input v-model="userForm.username" placeholder="请输入用户名称" />
        </el-form-item>
        <el-form-item label="头像" prop="avatar">
          <div class="avatar-upload">
            <div class="avatar-container">
              <el-upload class="avatar-uploader" action="#" :show-file-list="false" :auto-upload="false"
                :on-change="handleAvatarChange">
                <div class="avatar-preview" v-if="userForm.avatar">
                  <el-image :src="userForm.avatar" fit="cover">
                    <template #error>
                      <div class="image-slot">
                        <el-icon>
                          <Picture />
                        </el-icon>
                      </div>
                    </template>
                  </el-image>
                </div>
                <el-button v-else type="primary" plain>
                  <el-icon>
                    <Plus />
                  </el-icon>
                  上传头像
                </el-button>
              </el-upload>
              <el-button v-if="userForm.avatar" type="primary" class="preview-button" @click="handlePreview">
                <el-icon>
                  <View />
                </el-icon>
                <span>预览图片</span>
              </el-button>
            </div>
          </div>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="userForm.password" type="password" placeholder="请输入密码" show-password />
        </el-form-item>
        <el-form-item label="经验值" prop="exep">
          <el-input-number v-model="userForm.exep" :min="0" :max="99999" placeholder="请输入经验值" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <neumorphic-button @click="dialogVisible = false">取消</neumorphic-button>
          <neumorphic-button type="primary" @click="handleSubmit">确定</neumorphic-button>
        </span>
      </template>
    </el-dialog>

    <!-- 图片预览组件 -->
    <el-image-viewer v-if="previewVisible" :url-list="[userForm.avatar]" :initial-index="0"
      @close="previewVisible = false" />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Delete, Picture, View } from '@element-plus/icons-vue'
import { ElImageViewer } from 'element-plus'
import NeumorphicButton from '@/components/NeumorphicButton.vue'
import NeumorphicBackground from '@/components/NeumorphicBackground.vue'
import {
  userRegisterService,
  userLoginService,
  userListService,
  userDeleteService,
  userModifyService,
  userDeleteBatchService
} from '@/api/user'
import { formatDateTime } from '@/utils/date'

// 响应式数据
const loading = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('添加用户')
const selectedUsers = ref([])
const userFormRef = ref()

// 分页参数
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 搜索表单
const searchForm = reactive({
  keyword: '',
  exepMin: '',
  exepMax: ''
})

// 用户表单
const userForm = reactive({
  id: null,
  username: '',
  avatar: '',
  password: '',
  exep: 0,
  status: false,
  createTime: ''
})

// 表单验证规则
const formRules = {
  username: [
    { required: true, message: '请输入用户名称', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  exep: [
    { required: true, message: '请输入经验值', trigger: 'blur' },
    { type: 'number', min: 0, message: '经验值不能小于0', trigger: 'blur' }
  ]
}

// 用户列表数据
const users = ref([])

// 计算属性
const filteredUsers = computed(() => users.value)

// 方法
const getExperienceTagType = (exep) => {
  if (exep >= 3000) return 'success'
  if (exep >= 2000) return 'warning'
  if (exep >= 1000) return 'info'
  return 'danger'
}

// 获取用户列表
const fetchUserList = async () => {
  try {
    loading.value = true
    const params = {
      page: pagination.currentPage,
      pageSize: pagination.pageSize,
      keyword: searchForm.keyword,
      exepMin: searchForm.exepMin || undefined,
      exepMax: searchForm.exepMax || undefined
    }
    const res = await userListService(params)
    if (res.code === 200) {
      users.value = res.data.records
      pagination.total = res.data.total
      pagination.currentPage = res.data.current
      pagination.pageSize = res.data.size
    } else {
      ElMessage.error(res.msg || '获取用户列表失败')
    }
  } catch (error) {
    ElMessage.error('获取用户列表失败')
    console.error('获取用户列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.currentPage = 1
  fetchUserList()
}

// 重置搜索
const handleReset = () => {
  searchForm.keyword = ''
  searchForm.exepMin = ''
  searchForm.exepMax = ''
  pagination.currentPage = 1
  fetchUserList()
}

const handleAdd = () => {
  dialogTitle.value = '添加用户'
  dialogVisible.value = true
  resetForm()
}

const handleEdit = (row) => {
  dialogTitle.value = '编辑用户'
  dialogVisible.value = true
  Object.assign(userForm, { ...row })
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除用户 "${row.username}" 吗？`,
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    const res = await userDeleteService(row.id)
    if (res.code === 200) {
      ElMessage.success('删除成功')
      fetchUserList() // 重新获取用户列表
    } else {
      ElMessage.error(res.message || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
      console.error('删除用户失败:', error)
    } else {
      ElMessage.info('已取消删除')
    }
  }
}

const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedUsers.value.length} 个用户吗？`,
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    const userIds = selectedUsers.value.map(user => user.id)
    const res = await userDeleteBatchService(userIds)

    if (res.code === 200) {
      ElMessage.success('批量删除成功')
      selectedUsers.value = []
      fetchUserList() // 重新获取用户列表
    } else {
      ElMessage.error(res.msg || '批量删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('批量删除失败')
      console.error('批量删除用户失败:', error)
    } else {
      ElMessage.info('已取消删除')
    }
  }
}

const handleSelectionChange = (selection) => {
  selectedUsers.value = selection
}
// 根据有没有id 来判断是新增还是编辑
const handleSubmit = async () => {
  if (!userFormRef.value) return

  try {
    await userFormRef.value.validate()


    let res = await userModifyService(userForm)



    if (res.code === 200) {
      ElMessage.success(userForm.id ? '编辑成功' : '添加成功')
      dialogVisible.value = false
      resetForm()
      fetchUserList() // 重新获取用户列表
    } else {
      ElMessage.error(res.message || (userForm.id ? '编辑失败' : '添加失败'))
    }
  } catch (error) {
    ElMessage.error('请检查表单输入')
    console.error('提交表单失败:', error)
  }
}

// 重置表单
const resetForm = () => {
  userForm.id = null
  userForm.username = ''
  userForm.avatar = ''
  userForm.password = ''
  userForm.exep = 0
  userForm.status = false
  userForm.createTime = ''

  if (userFormRef.value) {
    userFormRef.value.clearValidate()
  }
}

// 分页大小改变
const handleSizeChange = (size) => {
  pagination.pageSize = size
  pagination.currentPage = 1
  fetchUserList()
}

// 页码改变
const handleCurrentChange = (page) => {
  pagination.currentPage = page
  fetchUserList()
}

// 处理头像上传
const handleAvatarChange = (file) => {
  const isImage = file.raw.type.startsWith('image/')
  if (!isImage) {
    ElMessage.error('只能上传图片文件！')
    return
  }

  const isLt2M = file.raw.size / 1024 / 1024 < 2
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB！')
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    userForm.avatar = e.target.result
  }
  reader.readAsDataURL(file.raw)
}

// 预览对话框显示状态
const previewVisible = ref(false)

// 处理头像预览
const handlePreview = () => {
  if (userForm.avatar) {
    previewVisible.value = true
  }
}

onMounted(() => {
  fetchUserList() // 组件挂载时获取用户列表
})
</script>

<style scoped>
.user-management {
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
  display: flex;
  align-items: center;
}

.search-form :deep(.el-form-item__label) {
  margin-bottom: 0;
  line-height: 32px;
  font-weight: 500;
  color: #1a1a1a;
}

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

:deep(.el-avatar) {
  border: 1px solid #f0f0f0;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
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

.avatar-upload {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.avatar-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar-preview {
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e5e7eb;
  transition: all 0.3s ease;
  cursor: pointer;
}

.avatar-preview:hover {
  border-color: #0066cc;
  transform: translateY(-1px);
}

.avatar-preview .el-image {
  width: 100%;
  height: 100%;
}

.image-slot {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background: #f5f7fa;
  color: #909399;
  font-size: 24px;
}

:deep(.el-upload) {
  width: 120px;
  height: 120px;
  border: 1px dashed #d9d9d9;
  border-radius: 8px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

:deep(.el-upload:hover) {
  border-color: #0066cc;
}

:deep(.el-button.is-plain) {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 8px;
  border: none;
}

:deep(.el-button.is-plain:hover) {
  background: #f5f7fa;
}

:deep(.el-button.is-link) {
  height: 32px;
  padding: 0 12px;
  font-size: 13px;
}

:deep(.el-button.is-link:hover) {
  background: #f5f7fa;
  border-radius: 4px;
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

@media (max-width: 768px) {
  .user-management {
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