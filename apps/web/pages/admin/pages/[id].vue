<script setup lang="ts">
    import type { ICategory, IFaqItem, IPage, PageStatus, PageTemplate } from "@tiny-tools/shared";
    import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-vue-next";

    definePageMeta({ layout: "admin", middleware: ["admin"] });

    const cms = useCms();
    const toast = useToast();
    const route = useRoute();
    const id = route.params.id as string;

    const loading = ref(true);
    const saving = ref(false);
    const error = ref("");
    const categories = ref<ICategory[]>([]);
    const allPages = ref<IPage[]>([]);
    const seoOpen = ref(false);

    const form = reactive({
        title: "",
        slug: "",
        content: "",
        excerpt: "",
        status: "draft" as PageStatus,
        template: "static" as PageTemplate,
        category: "",
        publishedAt: "",
        seo: {
            metaTitle: "",
            metaDescription: "",
            focusKeyword: "",
            ogImage: "",
            noIndex: false,
        },
        showInHeader: false,
        showInFooter: false,
        navLabel: "",
        footerGroup: "",
        footerGroupOrder: 0,
        faq: [] as IFaqItem[],
        relatedPages: [] as string[],
    });

    const existingFooterGroups = computed(() => {
        const groups = new Set<string>();
        for (const p of allPages.value) {
            if (p.footerGroup) groups.add(p.footerGroup);
        }
        return [...groups].sort();
    });

    function addFaq() {
        form.faq.push({ question: "", answer: "" });
    }

    function removeFaq(index: number) {
        form.faq.splice(index, 1);
    }

    function toggleRelatedPage(pageId: string) {
        const idx = form.relatedPages.indexOf(pageId);
        if (idx >= 0) {
            form.relatedPages.splice(idx, 1);
        } else {
            form.relatedPages.push(pageId);
        }
    }

    function formatDateForInput(date: Date | string | undefined): string {
        if (!date) return "";
        const d = new Date(date);
        return d.toISOString().slice(0, 16);
    }

    async function loadPage() {
        loading.value = true;
        error.value = "";

        try {
            const [page, catsRes, pagesRes] = await Promise.all([
                cms.pages.get(id),
                cms.categories.list({ pageSize: 100 }),
                cms.pages.list({ pageSize: 100 }),
            ]);

            categories.value = catsRes.items;
            allPages.value = pagesRes.items.filter((p: IPage) => p._id !== id);

            form.title = page.title;
            form.slug = page.slug;
            form.content = page.content;
            form.excerpt = page.excerpt || "";
            form.status = page.status;
            form.template = page.template;
            form.category = page.category || "";
            const np = page.navPlacement || "none";
            form.showInHeader = np === "header" || np === "both";
            form.showInFooter = np === "footer" || np === "both";
            form.navLabel = page.navLabel || "";
            form.footerGroup = page.footerGroup || "";
            form.footerGroupOrder = page.footerGroupOrder ?? 0;
            form.publishedAt = formatDateForInput(page.publishedAt);
            form.seo.metaTitle = page.seo?.metaTitle || "";
            form.seo.metaDescription = page.seo?.metaDescription || "";
            form.seo.focusKeyword = page.seo?.focusKeyword || "";
            form.seo.ogImage = page.seo?.ogImage || "";
            form.seo.noIndex = page.seo?.noIndex || false;
            form.faq = page.faq ? [...page.faq] : [];
            form.relatedPages = page.relatedPages ? [...page.relatedPages] : [];
        } catch (e: unknown) {
            error.value = e instanceof Error ? e.message : "Failed to load page.";
        } finally {
            loading.value = false;
        }
    }

    async function save(publish: boolean) {
        saving.value = true;
        error.value = "";

        try {
            const data: Partial<IPage> = {
                title: form.title,
                slug: form.slug,
                content: form.content,
                excerpt: form.excerpt || undefined,
                status: publish ? "published" : form.status,
                template: form.template,
                navPlacement:
                    form.showInHeader && form.showInFooter
                        ? "both"
                        : form.showInHeader
                          ? "header"
                          : form.showInFooter
                            ? "footer"
                            : "none",
                navLabel: form.navLabel || undefined,
                footerGroup: form.footerGroup || undefined,
                footerGroupOrder: form.footerGroup ? form.footerGroupOrder : undefined,
                category: form.category || null,
                publishedAt: form.publishedAt ? new Date(form.publishedAt) : undefined,
                seo: {
                    metaTitle: form.seo.metaTitle,
                    metaDescription: form.seo.metaDescription,
                    focusKeyword: form.seo.focusKeyword || undefined,
                    ogImage: form.seo.ogImage || undefined,
                    noIndex: form.seo.noIndex,
                },
                faq:
                    form.faq.length > 0
                        ? form.faq.filter((f) => f.question && f.answer)
                        : undefined,
                relatedPages: form.relatedPages.length > 0 ? form.relatedPages : undefined,
            };

            await cms.pages.update(id, data);
            error.value = "";
            toast.success(publish ? "Page published" : "Page saved");
        } catch (e: unknown) {
            toast.error(e instanceof Error ? e.message : "Failed to update page.");
        } finally {
            saving.value = false;
        }
    }

    onMounted(loadPage);
</script>

<template>
  <div>
    <div v-if="loading" class="text-sm text-content-muted">Loading page...</div>

    <template v-else>
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-content">Edit Page</h1>
        <div class="flex gap-2">
          <button
            :disabled="saving || !form.title"
            class="px-4 py-1.5 text-sm font-medium rounded-lg border border-divider text-content-secondary hover:bg-surface-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            @click="save(false)"
          >
            {{ saving ? 'Saving...' : 'Save' }}
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
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-content-secondary mb-1">Content (Markdown)</label>
              <AdminMarkdownEditor v-model="form.content" />
            </div>

            <div>
              <label class="block text-sm font-medium text-content-secondary mb-1">Excerpt</label>
              <textarea
                v-model="form.excerpt"
                rows="3"
                class="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none resize-y"
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
              <label class="block text-sm font-medium text-content-secondary mb-1">Template</label>
              <select
                v-model="form.template"
                class="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
              >
                <option value="tool">Tool</option>
                <option value="static">Static</option>
                <option value="landing">Landing</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-content-secondary mb-2">Navigation</label>
              <div class="space-y-1.5">
                <label class="flex items-center gap-2 text-sm text-content-secondary">
                  <input v-model="form.showInHeader" type="checkbox" class="rounded border-gray-300 text-brand-500 focus:ring-brand-500" />
                  Show in header
                </label>
                <label class="flex items-center gap-2 text-sm text-content-secondary">
                  <input v-model="form.showInFooter" type="checkbox" class="rounded border-gray-300 text-brand-500 focus:ring-brand-500" />
                  Show in footer
                </label>
              </div>
            </div>

            <div v-if="form.showInHeader || form.showInFooter">
              <label class="block text-sm font-medium text-content-secondary mb-1">
                Nav Label <span class="text-xs text-gray-500 font-normal">(optional, overrides title)</span>
              </label>
              <input
                v-model="form.navLabel"
                type="text"
                class="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                placeholder="Short label for navigation"
              />
            </div>

            <div v-if="form.showInFooter" class="space-y-3">
              <div>
                <label class="block text-sm font-medium text-content-secondary mb-1">Footer Group</label>
                <input
                  v-model="form.footerGroup"
                  type="text"
                  list="footer-groups"
                  class="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                  placeholder="e.g. Tools, Resources, Legal"
                />
                <datalist id="footer-groups">
                  <option v-for="g in existingFooterGroups" :key="g" :value="g" />
                </datalist>
              </div>
              <div>
                <label class="block text-sm font-medium text-content-secondary mb-1">Group Order</label>
                <input
                  v-model.number="form.footerGroupOrder"
                  type="number"
                  min="0"
                  class="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                />
              </div>
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
              />
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

          <!-- Related Pages -->
          <div class="bg-surface border border-surface-border rounded-xl p-5">
            <h3 class="text-sm font-semibold text-content mb-3">Related Pages</h3>
            <div v-if="allPages.length === 0" class="text-sm text-content-muted">No pages available.</div>
            <div v-else class="space-y-1 max-h-48 overflow-y-auto">
              <label
                v-for="p in allPages"
                :key="p._id"
                class="flex items-center gap-2 text-sm text-content-secondary py-0.5"
              >
                <input
                  type="checkbox"
                  :checked="form.relatedPages.includes(p._id)"
                  class="rounded border-gray-300 text-brand-500 focus:ring-brand-500"
                  @change="toggleRelatedPage(p._id)"
                />
                {{ p.title }}
              </label>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
