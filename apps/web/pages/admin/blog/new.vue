<script setup lang="ts">
    import type {
        BlogPostStatus,
        IAuthor,
        IBlogPost,
        ICategory,
        IFaqItem,
    } from "@tiny-tools/shared";
    import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-vue-next";

    definePageMeta({ layout: "admin", middleware: ["admin"] });

    const cms = useCms();
    const toast = useToast();
    const router = useRouter();

    const saving = ref(false);
    const error = ref("");
    const categories = ref<ICategory[]>([]);
    const authors = ref<IAuthor[]>([]);
    const allTags = ref<string[]>([]);
    const seoOpen = ref(false);

    const form = reactive({
        title: "",
        slug: "",
        content: "",
        excerpt: "",
        status: "draft" as BlogPostStatus,
        category: "",
        tags: [] as string[],
        coverImage: "",
        author: "",
        publishedAt: "",
        seo: {
            metaTitle: "",
            metaDescription: "",
            focusKeyword: "",
            ogImage: "",
            noIndex: false,
        },
        faq: [] as IFaqItem[],
    });

    const slugManuallyEdited = ref(false);

    function generateSlug(title: string): string {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");
    }

    function onTitleInput() {
        if (!slugManuallyEdited.value) {
            form.slug = generateSlug(form.title);
        }
    }

    function onSlugInput() {
        slugManuallyEdited.value = true;
    }

    const readingTime = computed(() => {
        const words = form.content.trim().split(/\s+/).filter(Boolean).length;
        return Math.max(1, Math.ceil(words / 200));
    });

    function addFaq() {
        form.faq.push({ question: "", answer: "" });
    }

    function removeFaq(index: number) {
        form.faq.splice(index, 1);
    }

    function validate(publish: boolean): string | null {
        if (!form.title.trim()) return "Title is required.";
        if (!form.content.trim()) return "Content is required.";
        if (!form.excerpt.trim()) return "Excerpt is required.";
        if (publish) {
            if (!form.seo.metaTitle.trim()) return "SEO meta title is required for publishing.";
            if (!form.seo.metaDescription.trim())
                return "SEO meta description is required for publishing.";
        }
        return null;
    }

    async function save(publish: boolean) {
        const validationError = validate(publish);
        if (validationError) {
            error.value = validationError;
            return;
        }

        saving.value = true;
        error.value = "";

        try {
            const data: Partial<IBlogPost> = {
                title: form.title,
                slug: form.slug || undefined,
                content: form.content,
                excerpt: form.excerpt,
                status: publish ? "published" : form.status,
                category: form.category || undefined,
                tags: form.tags.length > 0 ? form.tags : undefined,
                coverImage: form.coverImage || undefined,
                author: form.author || undefined,
                readingTime: readingTime.value,
                publishedAt: form.publishedAt ? new Date(form.publishedAt) : undefined,
                seo:
                    form.seo.metaTitle || form.seo.metaDescription
                        ? {
                              metaTitle: form.seo.metaTitle || undefined,
                              metaDescription: form.seo.metaDescription || undefined,
                              focusKeyword: form.seo.focusKeyword || undefined,
                              ogImage: form.seo.ogImage || undefined,
                              noIndex: form.seo.noIndex,
                          }
                        : undefined,
                faq:
                    form.faq.filter((f) => f.question.trim() && f.answer.trim()).length > 0
                        ? form.faq.filter((f) => f.question.trim() && f.answer.trim())
                        : undefined,
            };

            const created = await cms.blogPosts.create(data);
            toast.success(publish ? "Blog post published" : "Blog post created");
            await router.push(`/admin/blog/${created._id}`);
        } catch (e: unknown) {
            toast.error(e instanceof Error ? e.message : "Failed to save post.");
        } finally {
            saving.value = false;
        }
    }

    async function loadFormData() {
        try {
            const [catsRes, authorsRes, tagsRes] = await Promise.all([
                cms.categories.list({ pageSize: 100 }),
                cms.authors.list(),
                cms.blogPosts.allTags(),
            ]);
            categories.value = catsRes.items;
            authors.value = authorsRes;
            allTags.value = tagsRes;
        } catch {
            // Non-critical
        }
    }

    onMounted(loadFormData);
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-content">New Blog Post</h1>
        <p v-if="form.content" class="text-sm text-content-muted mt-1">
          ~{{ readingTime }} min read
        </p>
      </div>
      <div class="flex gap-2">
        <button
          :disabled="saving || !form.title"
          class="px-4 py-1.5 text-sm font-medium rounded-lg border border-divider text-content-secondary hover:bg-surface-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          @click="save(false)"
        >
          Save Draft
        </button>
        <button
          :disabled="saving || !form.title"
          class="px-4 py-1.5 text-sm font-medium rounded-lg bg-brand-500 text-white hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          @click="save(true)"
        >
          Publish
        </button>
      </div>
    </div>

    <div v-if="error" class="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
      {{ error }}
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-10 gap-6">
      <!-- Left column (70%) -->
      <div class="lg:col-span-7 space-y-4">
        <div class="bg-surface border border-surface-border rounded-xl p-5 space-y-4">
          <div>
            <label class="block text-sm font-medium text-content-secondary mb-1">Title</label>
            <input
              v-model="form.title"
              type="text"
              class="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
              placeholder="Post title"
              @input="onTitleInput"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-content-secondary mb-1">Content (Markdown)</label>
            <AdminMarkdownEditor v-model="form.content" placeholder="Write your post in Markdown..." />
          </div>

          <div>
            <label class="block text-sm font-medium text-content-secondary mb-1">Excerpt</label>
            <textarea
              v-model="form.excerpt"
              rows="3"
              class="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none resize-y"
              placeholder="Short summary for listings..."
            />
          </div>
        </div>

        <!-- SEO Section -->
        <div class="bg-surface border border-surface-border rounded-xl overflow-hidden">
          <button
            class="w-full flex items-center justify-between px-5 py-4 text-sm font-semibold text-content hover:bg-surface-secondary transition-colors"
            @click="seoOpen = !seoOpen"
          >
            SEO Settings
            <component :is="seoOpen ? ChevronUp : ChevronDown" :size="16" />
          </button>
          <div v-if="seoOpen" class="px-5 pb-5 space-y-4 border-t border-surface-border pt-4">
            <div>
              <label class="block text-sm font-medium text-content-secondary mb-1">
                Meta Title
                <span class="text-xs font-normal" :class="form.seo.metaTitle.length > 60 ? 'text-red-500' : 'text-gray-500'">
                  {{ form.seo.metaTitle.length }}/60
                </span>
              </label>
              <input
                v-model="form.seo.metaTitle"
                type="text"
                class="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-content-secondary mb-1">
                Meta Description
                <span class="text-xs font-normal" :class="form.seo.metaDescription.length > 160 ? 'text-red-500' : 'text-gray-500'">
                  {{ form.seo.metaDescription.length }}/160
                </span>
              </label>
              <textarea
                v-model="form.seo.metaDescription"
                rows="2"
                class="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none resize-y"
              />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-content-secondary mb-1">Focus Keyword</label>
                <input
                  v-model="form.seo.focusKeyword"
                  type="text"
                  class="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                />
              </div>
              <div>
                <AdminMediaPicker v-model="form.seo.ogImage" label="OG Image" />
              </div>
            </div>
            <label class="flex items-center gap-2 text-sm text-content-secondary">
              <input v-model="form.seo.noIndex" type="checkbox" class="rounded border-gray-300 text-brand-500 focus:ring-brand-500" />
              noIndex (hide from search engines)
            </label>
          </div>
        </div>

        <!-- FAQ Section -->
        <div class="bg-surface border border-surface-border rounded-xl p-5">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-sm font-semibold text-content">FAQ</h3>
            <button
              class="inline-flex items-center gap-1 text-sm text-brand-500 hover:text-brand-600"
              @click="addFaq"
            >
              <Plus :size="14" />
              Add Question
            </button>
          </div>
          <div v-if="form.faq.length === 0" class="text-sm text-content-muted">No FAQ items yet.</div>
          <div v-else class="space-y-3">
            <div
              v-for="(item, index) in form.faq"
              :key="index"
              class="p-3 border border-divider rounded-lg space-y-2"
            >
              <div class="flex items-start justify-between gap-2">
                <input
                  v-model="item.question"
                  type="text"
                  placeholder="Question"
                  class="flex-1 px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-900 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                />
                <button class="p-1 text-gray-500 hover:text-red-500" @click="removeFaq(index)">
                  <Trash2 :size="14" />
                </button>
              </div>
              <textarea
                v-model="item.answer"
                rows="2"
                placeholder="Answer"
                class="w-full px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-900 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none resize-y"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Right column (30%) -->
      <div class="lg:col-span-3 space-y-4">
        <div class="bg-surface border border-surface-border rounded-xl p-5 space-y-4">
          <div>
            <label class="block text-sm font-medium text-content-secondary mb-1">Status</label>
            <select
              v-model="form.status"
              class="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-content-secondary mb-1">Category</label>
            <select
              v-model="form.category"
              class="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
            >
              <option value="">None</option>
              <option v-for="cat in categories" :key="cat._id" :value="cat._id">{{ cat.name }}</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-content-secondary mb-1">Slug</label>
            <input
              v-model="form.slug"
              type="text"
              class="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 text-sm font-mono focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
              @input="onSlugInput"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-content-secondary mb-1">Tags</label>
            <AdminTagInput v-model="form.tags" :suggestions="allTags" />
          </div>

          <div>
            <AdminMediaPicker v-model="form.coverImage" label="Cover Image" />
          </div>

          <div>
            <label class="block text-sm font-medium text-content-secondary mb-1">Published Date</label>
            <input
              v-model="form.publishedAt"
              type="datetime-local"
              class="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
            />
          </div>
        </div>

        <!-- Author -->
        <div class="bg-surface border border-surface-border rounded-xl p-5 space-y-4">
          <h3 class="text-sm font-semibold text-content">Author</h3>
          <div>
            <label class="block text-sm font-medium text-content-secondary mb-1">Author</label>
            <select
              v-model="form.author"
              class="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
            >
              <option value="">None</option>
              <option v-for="a in authors" :key="a._id" :value="a._id">{{ a.name }}</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
