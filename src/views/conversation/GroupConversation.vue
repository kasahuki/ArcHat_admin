<template>
  <div class="group-conversation">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>群聊会话管理</span>
        </div>
      </template>

      <!-- 搜索表单 -->
      <neumorphic-background class="search-form-container">
        <el-form :model="searchForm" :inline="true" class="search-form">
          <el-form-item label="群组名称">
            <el-input v-model="searchForm.keyword" placeholder="请输入群组名称" clearable style="width: 200px" />
          </el-form-item>
          <el-form-item label="删除状态">
            <el-select v-model="searchForm.deleteStatus" placeholder="请选择状态" clearable style="width: 200px">
              <el-option label="正常" :value="0" />
              <el-option label="已删除" :value="1" />
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
          创建群聊
        </neumorphic-button>
        <neumorphic-button type="danger" :disabled="selectedGroups.length === 0" @click="handleBatchDelete">
          <el-icon><Delete /></el-icon>
          批量删除
        </neumorphic-button>
      </div>

      <!-- 群聊表格 -->
      <el-table 
        :data="filteredGroups" 
        style="width: 100%" 
        @selection-change="handleSelectionChange" 
        v-loading="loading"
        height="500"
        :max-height="500"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column type="index" label="序号" width="80" />
        <el-table-column label="群头像" width="100">
          <template #default="scope">
            <el-avatar :src="scope.row.avatar" :size="40">
              {{ scope.row.name.charAt(0) }}
            </el-avatar>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="群名称" />
        <el-table-column prop="deleteStatus" label="状态">
          <template #default="scope">
            <el-tag :type="scope.row.deleteStatus === 0 ? 'success' : 'danger'">
              {{ scope.row.deleteStatus === 0 ? '正常' : '已删除' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" sortable>
          <template #default="scope">
            {{ formatDateTime(scope.row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="updateTime" label="更新时间" sortable>
          <template #default="scope">
            {{ formatDateTime(scope.row.updateTime) }}
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

    <!-- 添加/编辑群聊对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px" @close="resetForm">
      <el-form ref="groupFormRef" :model="groupForm" :rules="formRules" label-width="80px">
        <el-form-item label="群名称" prop="name">
          <el-input v-model="groupForm.name" placeholder="请输入群名称" />
        </el-form-item>
        <el-form-item label="群头像" prop="avatar">
          <div class="avatar-upload">
            <div class="avatar-container">
              <el-upload
                class="avatar-uploader"
                action="#"
                :show-file-list="false"
                :auto-upload="false"
                :on-change="handleAvatarChange"
              >
                <div class="avatar-preview" v-if="groupForm.avatar">
                  <el-image :src="groupForm.avatar" fit="cover">
                    <template #error>
                      <div class="image-slot">
                        <el-icon><Picture /></el-icon>
                      </div>
                    </template>
                  </el-image>
                </div>
                <el-button v-else type="primary" plain>
                  <el-icon><Plus /></el-icon>
                  上传头像
                </el-button>
              </el-upload>
              <el-button v-if="groupForm.avatar" type="primary" class="preview-button" @click="handlePreview">
                <el-icon><View /></el-icon>
                <span>预览图片</span>
              </el-button>
            </div>
          </div>
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
    <el-image-viewer
      v-if="previewVisible"
      :url-list="[groupForm.avatar]"
      :initial-index="0"
      @close="previewVisible = false"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Delete, Picture, View } from '@element-plus/icons-vue'
import { ElImageViewer } from 'element-plus'
import NeumorphicButton from '@/components/NeumorphicButton.vue'
import NeumorphicBackground from '@/components/NeumorphicBackground.vue'
import { formatDateTime } from '@/utils/date'

// 响应式数据
const loading = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('创建群聊')
const selectedGroups = ref([])
const groupFormRef = ref()
const previewVisible = ref(false)

// 分页参数
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 搜索表单
const searchForm = reactive({
  keyword: '',
  deleteStatus: '',
  dateRange: []
})

// 群聊表单
const groupForm = reactive({
  id: null,
  name: '',
  avatar: '',
  deleteStatus: 0,
  createTime: '',
  updateTime: ''
})

// 表单验证规则
const formRules = {
  name: [
    { required: true, message: '请输入群名称', trigger: 'blur' },
    { min: 2, max: 16, message: '长度在 2 到 16 个字符', trigger: 'blur' }
  ],
  avatar: [
    { required: true, message: '请上传群头像', trigger: 'change' }
  ]
}

// 群聊列表数据
const groups = ref([])

// 计算属性
const filteredGroups = computed(() => groups.value)

// 获取群聊列表
const fetchGroupList = async () => {
  try {
    loading.value = true
    const params = {
      page: pagination.currentPage,
      pageSize: pagination.pageSize,
      keyword: searchForm.keyword,
      deleteStatus: searchForm.deleteStatus,
      startDate: searchForm.dateRange[0],
      endDate: searchForm.dateRange[1]
    }
    // TODO: 调用获取群聊列表API
    // const res = await getGroupListService(params)
    // if (res.code === 200) {
    //   groups.value = res.data.records
    //   pagination.total = res.data.total
    //   pagination.currentPage = res.data.current
    //   pagination.pageSize = res.data.size
    // }
  } catch (error) {
    ElMessage.error('获取群聊列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.currentPage = 1
  fetchGroupList()
}

// 重置搜索
const handleReset = () => {
  searchForm.keyword = ''
  searchForm.deleteStatus = ''
  searchForm.dateRange = []
  handleSearch()
}

// 表格选择变化
const handleSelectionChange = (selection) => {
  selectedGroups.value = selection
}

// 添加群聊
const handleAdd = () => {
  dialogTitle.value = '创建群聊'
  dialogVisible.value = true
}

// 编辑群聊
const handleEdit = (row) => {
  dialogTitle.value = '编辑群聊'
  Object.assign(groupForm, row)
  dialogVisible.value = true
}

// 删除群聊
const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该群聊吗？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      // TODO: 调用删除API
      // await deleteGroupService(row.id)
      ElMessage.success('删除成功')
      fetchGroupList()
    } catch (error) {
      ElMessage.error('删除失败')
    }
  })
}

// 批量删除
const handleBatchDelete = () => {
  if (selectedGroups.value.length === 0) {
    ElMessage.warning('请选择要删除的群聊')
    return
  }
  ElMessageBox.confirm(`确定要删除选中的 ${selectedGroups.value.length} 个群聊吗？`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      // TODO: 调用批量删除API
      // await deleteGroupBatchService(selectedGroups.value.map(item => item.id))
      ElMessage.success('批量删除成功')
      fetchGroupList()
    } catch (error) {
      ElMessage.error('批量删除失败')
    }
  })
}

// 头像上传
const handleAvatarChange = (file) => {
  // TODO: 实现头像上传逻辑
  console.log('上传文件:', file)
}

// 预览头像
const handlePreview = () => {
  previewVisible.value = true
}

// 提交表单
const handleSubmit = async () => {
  if (!groupFormRef.value) return
  await groupFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        // TODO: 调用创建/编辑API
        // if (groupForm.id) {
        //   await updateGroupService(groupForm)
        // } else {
        //   await createGroupService(groupForm)
        // }
        ElMessage.success(groupForm.id ? '编辑成功' : '创建成功')
        dialogVisible.value = false
        fetchGroupList()
      } catch (error) {
        ElMessage.error(groupForm.id ? '编辑失败' : '创建失败')
      }
    }
  })
}

// 重置表单
const resetForm = () => {
  if (groupFormRef.value) {
    groupFormRef.value.resetFields()
  }
  Object.assign(groupForm, {
    id: null,
    name: '',
    avatar: '',
    deleteStatus: 0,
    createTime: '',
    updateTime: ''
  })
}

// 分页大小改变
const handleSizeChange = (val) => {
  pagination.pageSize = val
  fetchGroupList()
}

// 页码改变
const handleCurrentChange = (val) => {
  pagination.currentPage = val
  fetchGroupList()
}

onMounted(() => {
  fetchGroupList()
})
</script>

<style scoped>
.group-conversation {
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

:deep(.el-table) {
  border-radius: 8px;
  overflow: hidden;
  font-size: 13px;
  margin: 0 20px;
}

:deep(.el-table__header-wrapper) {
  background: #fafafa;
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

.avatar-upload {
  display: flex;
  align-items: center;
}

.avatar-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.avatar-preview {
  width: 100px;
  height: 100px;
  border-radius: 8px;
  overflow: hidden;
}

.avatar-preview :deep(img) {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.preview-button {
  display: flex;
  align-items: center;
  gap: 5px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style> 