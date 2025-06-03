<script setup lang="ts">
import { ref } from 'vue'
import { useGithubRepositories } from '@/composables/useGithubRepositories'

/**
 * Refs
 */
const perPage = ref<number>(10)
const sortOption = ref(`updated:desc`)

const {
  repositories,
  total,
  loading,
  error,
  currentPage,
  hasNextPage,
  updateParams,
  nextPage,
  prevPage,
} = useGithubRepositories({
  perPage: perPage.value,
  sort: 'updated',
})

const handleSortChange = () => {
  const [sort, direction] = sortOption.value.split(':')
  // OPTIMIZE: type assertion
  updateParams({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sort: sort as any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    direction: direction as any,
    page: 1,
  })
}

const handlePerPageChange = () => {
  updateParams({
    perPage: perPage.value,
    page: 1,
  })
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - date.getTime())
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
    return 'Today'
  }
  else if (diffDays === 1) {
    return 'Yesterday'
  }
  else if (diffDays < 30) {
    return `${diffDays} days ago`
  }
  else {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }
}
</script>

<template>
  <div class="github-repository-table">
    <div class="repository-controls">
      <div class="sort-controls">
        <label for="sort-select">Sort by:</label>
        <select
          id="sort-select"
          v-model="sortOption"
          @change="handleSortChange"
        >
          <option value="updated:desc">
            Updated (Newest)
          </option>
          <option value="updated:asc">
            Updated (Oldest)
          </option>
          <option value="created:desc">
            Created (Newest)
          </option>
          <option value="created:asc">
            Created (Oldest)
          </option>
          <option value="full_name:asc">
            Name (A-Z)
          </option>
          <option value="full_name:desc">
            Name (Z-A)
          </option>
        </select>
      </div>
      <div class="page-size-control">
        <label for="page-size">Show:</label>
        <select
          id="page-size"
          v-model="perPage"
          @change="handlePerPageChange"
        >
          <option value="10">
            10
          </option>
          <option value="25">
            25
          </option>
          <option value="50">
            50
          </option>
          <option value="100">
            100
          </option>
        </select>
      </div>
    </div>

    <div
      v-if="loading"
      class="loading-state"
    >
      Loading repositories...
    </div>

    <div
      v-else-if="error"
      class="error-state"
    >
      Error loading repositories: {{ error }}
    </div>

    <div
      v-else-if="repositories.length === 0"
      class="empty-state"
    >
      No repositories found
    </div>

    <table
      v-else
      class="repository-table"
    >
      <thead>
        <tr>
          <th>Repository</th>
          <th>Description</th>
          <th>Language</th>
          <th>Stars</th>
          <th>Updated</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="repo in repositories"
          :key="repo.id"
          class="repository-row"
        >
          <td class="repository-name">
            <a
              :href="repo.html_url"
              target="_blank"
              rel="noopener noreferrer"
            >
              {{ repo.name }}
            </a>
            <span
              v-if="repo.fork"
              class="fork-badge"
            >Fork</span>
            <span
              v-if="repo.archived"
              class="archived-badge"
            >Archived</span>
          </td>
          <td class="repository-description">
            {{ repo.description || 'No description' }}
          </td>
          <td class="repository-language">
            {{ repo.language || '-' }}
          </td>
          <td class="repository-stars">
            {{ repo.stargazers_count }}
          </td>
          <td class="repository-updated">
            {{ formatDate(repo.updated_at || '') }}
          </td>
        </tr>
      </tbody>
    </table>

    <div
      v-if="repositories.length > 0"
      class="pagination-controls"
    >
      <button
        :disabled="currentPage <= 1"
        class="pagination-button"
        @click="prevPage"
      >
        Previous
      </button>
      <span class="page-info">
        Page {{ currentPage }} {{ total ? `of ${Math.ceil(total / perPage)}` : '' }}
      </span>
      <button
        :disabled="!hasNextPage"
        class="pagination-button"
        @click="nextPage"
      >
        Next
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.github-repository-table {
  width: 100%;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
}

.repository-controls {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  align-items: center;
}

select {
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid #ddd;
  margin-left: 0.5rem;
}

.repository-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1rem;
}

th, td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

th {
  font-weight: 600;
  background-color: #f6f8fa;
}

.repository-name a {
  color: #0366d6;
  font-weight: 600;
  text-decoration: none;
}

.repository-name a:hover {
  text-decoration: underline;
}

.fork-badge, .archived-badge {
  display: inline-block;
  font-size: 0.75rem;
  padding: 0.1rem 0.5rem;
  border-radius: 2rem;
  margin-left: 0.5rem;
  font-weight: 500;
}

.fork-badge {
  background-color: #e1e4e8;
  color: #586069;
}

.archived-badge {
  background-color: #ffefc6;
  color: #9e6a03;
}

.pagination-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 1rem;
}

.pagination-button {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: #f6f8fa;
  cursor: pointer;
  font-weight: 500;
}

.pagination-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  margin: 0 1rem;
}

.loading-state, .error-state, .empty-state {
  padding: 2rem;
  text-align: center;
  background-color: #f6f8fa;
  border-radius: 4px;
  margin: 1rem 0;
}

.error-state {
  color: #cb2431;
  background-color: #ffeef0;
}
</style>
