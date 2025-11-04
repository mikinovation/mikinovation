<script setup lang="ts">
const { data: pages } = await useAsyncData('pages', () =>
  queryCollection('wiki')
    .all()
)

const selectedLabel = ref<string | null>(null)

const allLabels = computed(() => {
  if (!pages.value) return []
  const labelSet = new Set<string>()
  pages.value.forEach(page => {
    page.labels?.forEach((label: string) => labelSet.add(label))
  })
  return Array.from(labelSet).sort()
})

const filteredPages = computed(() => {
  if (!pages.value) return []
  if (!selectedLabel.value) return pages.value
  return pages.value.filter(page =>
    page.labels?.includes(selectedLabel.value!)
  )
})

const filterByLabel = (label: string | null) => {
  selectedLabel.value = label
}

useSeoMeta({
  title: 'Wiki - mikinovation',
  description: 'ナレッジベース。技術的なドキュメントやメモを整理しています。',
})
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <div class="text-center mb-12">
      <h1 class="text-4xl font-bold mb-4">Wiki</h1>
      <p class="text-gray-600">ナレッジベース</p>
    </div>

    <!-- Wiki Purpose and Policy Section -->
    <div class="max-w-4xl mx-auto mb-12 bg-white rounded-lg shadow-sm p-8">
      <section class="mb-8">
        <h2 class="text-2xl font-semibold mb-4 text-gray-800">このWikiについて</h2>
        <p class="text-gray-700 leading-relaxed mb-4">
          このWikiは、技術的な知識やノウハウを体系的に整理・共有するためのナレッジベースです。
          学習した内容、問題解決の過程、ベストプラクティスなどを記録し、
          将来の自分や他の開発者が参照できる形で保存しています。
        </p>
      </section>

      <section class="mb-8">
        <h2 class="text-2xl font-semibold mb-4 text-gray-800">目的</h2>
        <ul class="list-disc list-inside space-y-2 text-gray-700">
          <li>技術的な知識の蓄積と共有</li>
          <li>問題解決のパターンとノウハウの記録</li>
          <li>学習内容の整理と定着</li>
          <li>プロジェクトのドキュメント管理</li>
          <li>チーム内での知識共有の促進</li>
        </ul>
      </section>

      <section>
        <h2 class="text-2xl font-semibold mb-4 text-gray-800">記載方針</h2>
        <div class="space-y-3 text-gray-700">
          <div>
            <h3 class="font-semibold mb-1">完成を求めない</h3>
            <p class="text-sm">途中段階でも積極的に記録します。完璧を目指すより、まず書き残すことを優先します。</p>
          </div>
          <div>
            <h3 class="font-semibold mb-1">明確で分かりやすく</h3>
            <p class="text-sm">技術的な内容を誰でも理解できるよう、明確で簡潔な説明を心がけます。</p>
          </div>
          <div>
            <h3 class="font-semibold mb-1">実用的な内容</h3>
            <p class="text-sm">実際のプロジェクトや開発で役立つ、実践的な情報を優先します。</p>
          </div>
          <div>
            <h3 class="font-semibold mb-1">継続的な更新</h3>
            <p class="text-sm">技術の進化に合わせて、定期的に内容を見直し更新します。</p>
          </div>
          <div>
            <h3 class="font-semibold mb-1">体系的な整理</h3>
            <p class="text-sm">カテゴリーやタグを活用し、情報を探しやすく整理します。</p>
          </div>
        </div>
      </section>
    </div>

    <!-- Page List Section -->
    <div class="max-w-4xl mx-auto">
      <h2 class="text-2xl font-semibold mb-6 text-gray-800">記事一覧</h2>

      <!-- Label Filter -->
      <div v-if="allLabels.length > 0" class="mb-6">
        <div class="flex flex-wrap gap-2">
          <button
            :class="[
              'px-4 py-2 text-sm font-medium rounded-full transition-colors',
              selectedLabel === null
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            ]"
            @click="filterByLabel(null)"
          >
            すべて
          </button>
          <button
            v-for="label in allLabels"
            :key="label"
            :class="[
              'px-4 py-2 text-sm font-medium rounded-full transition-colors',
              selectedLabel === label
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            ]"
            @click="filterByLabel(label)"
          >
            {{ label }}
          </button>
        </div>
      </div>

      <WikiPageList v-if="filteredPages.length > 0" :pages="filteredPages" />
      <div v-else class="text-center text-gray-500 py-8">
        ページがありません
      </div>
    </div>
  </div>
</template>
