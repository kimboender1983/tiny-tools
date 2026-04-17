<script setup lang="ts">
    import type {
        BlogPostStatus,
        IAffiliate,
        IAuthor,
        IBlogPost,
        ICategory,
        IFaqItem,
    } from "@tiny-tools/shared";
    import { ChevronDown, ChevronUp, Plus, Sparkles, Trash2 } from "lucide-vue-next";

    definePageMeta({ layout: "admin", middleware: ["admin"] });

    const cms = useCms();
    const toast = useToast();
    const route = useRoute();
    const id = route.params.id as string;

    const loading = ref(true);
    const saving = ref(false);
    const error = ref("");
    const categories = ref<ICategory[]>([]);
    const authors = ref<IAuthor[]>([]);
    const affiliates = ref<IAffiliate[]>([]);
    const allTags = ref<string[]>([]);
    const seoOpen = ref(false);
    const ctaOpen = ref(false);
    const refineOpen = ref(false);
    const refinePrompt = ref("");
    const refining = ref(false);
    const showContentPreview = ref(false);

    type PendingRefinement = {
        title: string;
        content: string;
        excerpt: string;
        tags: string[];
        seo: { metaTitle: string; metaDescription: string; focusKeyword?: string };
        faq: Array<{ question: string; answer: string }>;
    };
    const pendingRefinement = ref<PendingRefinement | null>(null);

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
        techLogo: "",
        techLogoColor: "",
        techLogoBgColor: "",
        techLogoBgColorTo: "",
        techLogoPickboxColor: "",
        techLogoTitleColor: "",
        publishedAt: "",
        seo: {
            metaTitle: "",
            metaDescription: "",
            focusKeyword: "",
            ogImage: "",
            noIndex: false,
        },
        affiliateCta: {
            affiliate: "",
            headline: "",
            body: "",
            buttonText: "",
            disclaimer: "",
        },
        faq: [] as IFaqItem[],
    });

    const selectedCategoryName = computed(
        () => categories.value.find((c) => c._id === form.category)?.name || "",
    );

    const readingTime = computed(() => {
        const words = form.content.trim().split(/\s+/).filter(Boolean).length;
        return Math.max(1, Math.ceil(words / 200));
    });

    const refinementChanges = computed(() => {
        const r = pendingRefinement.value;
        if (!r) return null;
        const wc = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;
        return {
            title: r.title !== form.title
                ? { before: form.title, after: r.title } : null,
            excerpt: r.excerpt !== form.excerpt
                ? { before: form.excerpt, after: r.excerpt } : null,
            content: r.content !== form.content
                ? { before: `${wc(form.content)} words`, after: `${wc(r.content)} words`, full: r.content }
                : null,
            tags: JSON.stringify(r.tags) !== JSON.stringify(form.tags)
                ? { before: form.tags.join(", ") || "—", after: r.tags.join(", ") || "—" } : null,
            metaTitle: r.seo.metaTitle !== form.seo.metaTitle
                ? { before: form.seo.metaTitle || "—", after: r.seo.metaTitle } : null,
            metaDescription: r.seo.metaDescription !== form.seo.metaDescription
                ? { before: form.seo.metaDescription || "—", after: r.seo.metaDescription } : null,
            focusKeyword: (r.seo.focusKeyword || "") !== (form.seo.focusKeyword || "")
                ? { before: form.seo.focusKeyword || "—", after: r.seo.focusKeyword || "—" } : null,
            faq: JSON.stringify(r.faq) !== JSON.stringify(form.faq)
                ? { before: `${form.faq.length} item${form.faq.length !== 1 ? "s" : ""}`, after: `${r.faq.length} item${r.faq.length !== 1 ? "s" : ""}` }
                : null,
        };
    });

    const hasAnyChanges = computed(() =>
        refinementChanges.value !== null &&
        Object.values(refinementChanges.value).some((v) => v !== null),
    );

    function addFaq() {
        form.faq.push({ question: "", answer: "" });
    }

    function removeFaq(index: number) {
        form.faq.splice(index, 1);
    }

    function formatDateForInput(date: Date | string | undefined): string {
        if (!date) return "";
        const d = new Date(date);
        return d.toISOString().slice(0, 16);
    }

    async function loadPost() {
        loading.value = true;
        error.value = "";

        try {
            const [post, catsRes, authorsRes, affiliatesRes, tagsRes] = await Promise.all([
                cms.blogPosts.get(id),
                cms.categories.list({ pageSize: 100 }),
                cms.authors.list(),
                cms.affiliates.list({ pageSize: 100 }),
                cms.blogPosts.allTags(),
            ]);

            categories.value = catsRes.items;
            authors.value = authorsRes;
            affiliates.value = affiliatesRes.items;
            allTags.value = tagsRes;

            form.title = post.title;
            form.slug = post.slug;
            form.content = post.content;
            form.excerpt = post.excerpt;
            form.status = post.status;
            form.category = post.category || "";
            form.tags = post.tags || [];
            form.coverImage = post.coverImage || "";
            form.author = (post.author as string) || "";
            form.techLogo = (post.techLogo as string) || "";
            form.techLogoColor = post.techLogoColor || "";
            form.techLogoBgColor = post.techLogoBgColor || "";
            form.techLogoBgColorTo = post.techLogoBgColorTo || "";
            form.techLogoPickboxColor = post.techLogoPickboxColor || "";
            form.techLogoTitleColor = post.techLogoTitleColor || "";
            if (post.affiliateCta) {
                form.affiliateCta.affiliate = post.affiliateCta.affiliate || "";
                form.affiliateCta.headline = post.affiliateCta.headline || "";
                form.affiliateCta.body = post.affiliateCta.body || "";
                form.affiliateCta.buttonText = post.affiliateCta.buttonText || "";
                form.affiliateCta.disclaimer = post.affiliateCta.disclaimer || "";
                ctaOpen.value = true;
            }
            form.publishedAt = formatDateForInput(post.publishedAt);
            form.seo.metaTitle = post.seo?.metaTitle || "";
            form.seo.metaDescription = post.seo?.metaDescription || "";
            form.seo.focusKeyword = post.seo?.focusKeyword || "";
            form.seo.ogImage = post.seo?.ogImage || "";
            form.seo.noIndex = post.seo?.noIndex || false;
            form.faq = post.faq?.map((f) => ({ question: f.question, answer: f.answer })) || [];
        } catch (e: unknown) {
            error.value = e instanceof Error ? e.message : "Failed to load post.";
        } finally {
            loading.value = false;
        }
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
                coverImage: form.coverImage || "",
                author: form.author || undefined,
                techLogo: form.techLogo || undefined,
                techLogoColor: form.techLogoColor || undefined,
                techLogoBgColor: form.techLogoBgColor || undefined,
                techLogoBgColorTo: form.techLogoBgColorTo || undefined,
                techLogoPickboxColor: form.techLogoPickboxColor || undefined,
                techLogoTitleColor: form.techLogoTitleColor || undefined,
                affiliateCta:
                    form.affiliateCta.affiliate &&
                    form.affiliateCta.headline &&
                    form.affiliateCta.buttonText
                        ? {
                              affiliate: form.affiliateCta.affiliate,
                              headline: form.affiliateCta.headline,
                              body: form.affiliateCta.body || undefined,
                              buttonText: form.affiliateCta.buttonText,
                              disclaimer: form.affiliateCta.disclaimer || undefined,
                          }
                        : undefined,
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

            await cms.blogPosts.update(id, data);
            error.value = "";
            toast.success(publish ? "Blog post published" : "Blog post saved");
        } catch (e: unknown) {
            toast.error(e instanceof Error ? e.message : "Failed to update post.");
        } finally {
            saving.value = false;
        }
    }

    async function refineWithAi() {
        if (!refinePrompt.value.trim() || refining.value) return;
        refining.value = true;
        showContentPreview.value = false;
        try {
            const result = await cms.blogWriter.refine(id, refinePrompt.value.trim());
            pendingRefinement.value = result;
            refinePrompt.value = "";
        } catch (e: unknown) {
            toast.error(e instanceof Error ? e.message : "Refinement failed");
        } finally {
            refining.value = false;
        }
    }

    function acceptRefinement() {
        const r = pendingRefinement.value;
        if (!r) return;
        form.title = r.title;
        form.content = r.content;
        form.excerpt = r.excerpt;
        form.tags = r.tags;
        if (r.seo.metaTitle) form.seo.metaTitle = r.seo.metaTitle;
        if (r.seo.metaDescription) form.seo.metaDescription = r.seo.metaDescription;
        if (r.seo.focusKeyword) form.seo.focusKeyword = r.seo.focusKeyword;
        if (r.faq.length > 0) form.faq = r.faq;
        pendingRefinement.value = null;
        showContentPreview.value = false;
        refineOpen.value = false;
        toast.success("Changes applied — save when ready");
    }

    function discardRefinement() {
        pendingRefinement.value = null;
        showContentPreview.value = false;
    }

    onMounted(loadPost);
</script>

<template>
  <div>
    <div v-if="loading" class="text-sm text-content-muted">Loading post...</div>

    <template v-else>
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-content">Edit Blog Post</h1>
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

          <!-- Affiliate CTA -->
          <div class="bg-surface border border-surface-border rounded-xl overflow-hidden">
            <button
              type="button"
              class="w-full flex items-center justify-between p-5"
              @click="ctaOpen = !ctaOpen"
            >
              <h3 class="text-sm font-semibold text-content">Affiliate CTA</h3>
              <ChevronDown v-if="!ctaOpen" :size="16" class="text-content-muted" />
              <ChevronUp v-else :size="16" class="text-content-muted" />
            </button>
            <div v-if="ctaOpen" class="px-5 pb-5 space-y-3">
              <div>
                <label class="block text-sm font-medium text-content-secondary mb-1">Affiliate</label>
                <select
                  v-model="form.affiliateCta.affiliate"
                  class="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                >
                  <option value="">None</option>
                  <option v-for="aff in affiliates" :key="aff._id" :value="aff.slug">{{ aff.name }} ({{ aff.slug }})</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-content-secondary mb-1">Headline</label>
                <input
                  v-model="form.affiliateCta.headline"
                  type="text"
                  class="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                  placeholder="Try Vultr Free"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-content-secondary mb-1">Body (Markdown)</label>
                <textarea
                  v-model="form.affiliateCta.body"
                  rows="3"
                  class="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                  placeholder="Get $100 free credit when you sign up..."
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-content-secondary mb-1">Button Text</label>
                <input
                  v-model="form.affiliateCta.buttonText"
                  type="text"
                  class="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                  placeholder="Get Started Free →"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-content-secondary mb-1">Disclaimer (optional)</label>
                <input
                  v-model="form.affiliateCta.disclaimer"
                  type="text"
                  class="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                  placeholder="We may earn a commission at no extra cost to you."
                />
              </div>
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
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-content-secondary mb-1">Tags</label>
              <AdminTagInput v-model="form.tags" :suggestions="allTags" />
            </div>

            <div>
              <AdminMediaPicker v-model="form.coverImage" label="Cover Image" />
              <div class="mt-2 p-3 rounded-lg bg-blue-50 border border-blue-200 text-xs text-blue-800">
                If no cover image is uploaded, the auto-generated cover below is used.
              </div>
            </div>

            <AdminCoverEditor
              v-model:tech-logo="form.techLogo"
              v-model:logo-color="form.techLogoColor"
              v-model:bg-color="form.techLogoBgColor"
              v-model:bg-color-to="form.techLogoBgColorTo"
              v-model:pickbox-color="form.techLogoPickboxColor"
              v-model:title-color="form.techLogoTitleColor"
              :title="form.title"
              :category="selectedCategoryName"
            />

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

          <!-- Refine with AI -->
          <div class="bg-surface border border-surface-border rounded-xl overflow-hidden">
            <button
              class="w-full flex items-center justify-between px-5 py-4 text-sm font-semibold text-content hover:bg-surface-secondary transition-colors"
              @click="refineOpen = !refineOpen"
            >
              <span class="flex items-center gap-2">
                <Sparkles :size="15" class="text-brand-500" />
                Refine with AI
                <span
                  v-if="pendingRefinement"
                  class="inline-block w-2 h-2 rounded-full bg-amber-400"
                  title="Changes pending review"
                />
              </span>
              <component :is="refineOpen ? ChevronUp : ChevronDown" :size="16" class="text-content-muted" />
            </button>

            <div v-if="refineOpen" class="border-t border-surface-border">
              <!-- Input mode -->
              <div v-if="!pendingRefinement" class="px-5 pb-5 pt-4 space-y-3">
                <p class="text-xs text-content-muted leading-relaxed">
                  Describe what you want to change. Tone and style will be preserved.
                </p>
                <textarea
                  v-model="refinePrompt"
                  rows="4"
                  :disabled="refining"
                  class="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none resize-y disabled:opacity-50"
                  placeholder="e.g. The library v2 is not out yet, update references to say v2 is coming soon..."
                />
                <button
                  :disabled="!refinePrompt.trim() || refining"
                  class="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-brand-500 text-white hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  @click="refineWithAi"
                >
                  <Sparkles v-if="!refining" :size="14" />
                  <span v-if="refining" class="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {{ refining ? 'Refining...' : 'Refine post' }}
                </button>
              </div>

              <!-- Review mode -->
              <div v-else class="px-5 pb-5 pt-4 space-y-3">
                <!-- No changes detected -->
                <div v-if="!hasAnyChanges" class="py-3 text-center space-y-3">
                  <p class="text-xs text-content-muted">No changes were detected. Try a more specific prompt.</p>
                  <button class="text-xs text-brand-500 underline underline-offset-2" @click="discardRefinement">
                    Try again
                  </button>
                </div>

                <template v-else-if="refinementChanges">
                  <p class="text-xs font-semibold text-content-secondary">Review proposed changes:</p>

                  <div class="space-y-2 max-h-96 overflow-y-auto pr-0.5">
                    <!-- Title -->
                    <div v-if="refinementChanges.title" class="rounded-lg border border-divider overflow-hidden text-xs">
                      <div class="px-3 py-1 bg-surface-secondary text-[10px] font-semibold text-content-muted uppercase tracking-wide">Title</div>
                      <div class="px-3 py-2 space-y-1">
                        <p class="text-content-muted line-through leading-snug">{{ refinementChanges.title.before }}</p>
                        <p class="text-green-700 dark:text-green-400 font-medium leading-snug">{{ refinementChanges.title.after }}</p>
                      </div>
                    </div>

                    <!-- Excerpt -->
                    <div v-if="refinementChanges.excerpt" class="rounded-lg border border-divider overflow-hidden text-xs">
                      <div class="px-3 py-1 bg-surface-secondary text-[10px] font-semibold text-content-muted uppercase tracking-wide">Excerpt</div>
                      <div class="px-3 py-2 space-y-1">
                        <p class="text-content-muted line-through leading-snug">{{ refinementChanges.excerpt.before }}</p>
                        <p class="text-green-700 dark:text-green-400 font-medium leading-snug">{{ refinementChanges.excerpt.after }}</p>
                      </div>
                    </div>

                    <!-- Content -->
                    <div v-if="refinementChanges.content" class="rounded-lg border border-divider overflow-hidden text-xs">
                      <div class="px-3 py-1 bg-surface-secondary text-[10px] font-semibold text-content-muted uppercase tracking-wide">Content</div>
                      <div class="px-3 py-2 space-y-2">
                        <div class="flex items-center gap-1.5">
                          <span class="text-content-muted line-through">{{ refinementChanges.content.before }}</span>
                          <span class="text-content-muted">→</span>
                          <span class="text-green-700 dark:text-green-400 font-medium">{{ refinementChanges.content.after }}</span>
                        </div>
                        <button
                          class="text-brand-500 hover:text-brand-600 underline underline-offset-2"
                          @click="showContentPreview = !showContentPreview"
                        >
                          {{ showContentPreview ? 'Hide preview' : 'Show preview' }}
                        </button>
                        <div
                          v-if="showContentPreview"
                          class="mt-1 p-2 rounded bg-surface-secondary text-content text-[11px] max-h-48 overflow-y-auto whitespace-pre-wrap font-mono leading-relaxed"
                        >{{ refinementChanges.content.full }}</div>
                      </div>
                    </div>

                    <!-- Tags -->
                    <div v-if="refinementChanges.tags" class="rounded-lg border border-divider overflow-hidden text-xs">
                      <div class="px-3 py-1 bg-surface-secondary text-[10px] font-semibold text-content-muted uppercase tracking-wide">Tags</div>
                      <div class="px-3 py-2 space-y-1">
                        <p class="text-content-muted line-through leading-snug">{{ refinementChanges.tags.before }}</p>
                        <p class="text-green-700 dark:text-green-400 font-medium leading-snug">{{ refinementChanges.tags.after }}</p>
                      </div>
                    </div>

                    <!-- SEO Title -->
                    <div v-if="refinementChanges.metaTitle" class="rounded-lg border border-divider overflow-hidden text-xs">
                      <div class="px-3 py-1 bg-surface-secondary text-[10px] font-semibold text-content-muted uppercase tracking-wide">SEO Title</div>
                      <div class="px-3 py-2 space-y-1">
                        <p class="text-content-muted line-through leading-snug">{{ refinementChanges.metaTitle.before }}</p>
                        <p class="text-green-700 dark:text-green-400 font-medium leading-snug">{{ refinementChanges.metaTitle.after }}</p>
                      </div>
                    </div>

                    <!-- Meta Description -->
                    <div v-if="refinementChanges.metaDescription" class="rounded-lg border border-divider overflow-hidden text-xs">
                      <div class="px-3 py-1 bg-surface-secondary text-[10px] font-semibold text-content-muted uppercase tracking-wide">Meta Description</div>
                      <div class="px-3 py-2 space-y-1">
                        <p class="text-content-muted line-through leading-snug">{{ refinementChanges.metaDescription.before }}</p>
                        <p class="text-green-700 dark:text-green-400 font-medium leading-snug">{{ refinementChanges.metaDescription.after }}</p>
                      </div>
                    </div>

                    <!-- Focus Keyword -->
                    <div v-if="refinementChanges.focusKeyword" class="rounded-lg border border-divider overflow-hidden text-xs">
                      <div class="px-3 py-1 bg-surface-secondary text-[10px] font-semibold text-content-muted uppercase tracking-wide">Focus Keyword</div>
                      <div class="px-3 py-2 space-y-1">
                        <p class="text-content-muted line-through leading-snug">{{ refinementChanges.focusKeyword.before }}</p>
                        <p class="text-green-700 dark:text-green-400 font-medium leading-snug">{{ refinementChanges.focusKeyword.after }}</p>
                      </div>
                    </div>

                    <!-- FAQ -->
                    <div v-if="refinementChanges.faq" class="rounded-lg border border-divider overflow-hidden text-xs">
                      <div class="px-3 py-1 bg-surface-secondary text-[10px] font-semibold text-content-muted uppercase tracking-wide">FAQ</div>
                      <div class="px-3 py-2 flex items-center gap-1.5">
                        <span class="text-content-muted line-through">{{ refinementChanges.faq.before }}</span>
                        <span class="text-content-muted">→</span>
                        <span class="text-green-700 dark:text-green-400 font-medium">{{ refinementChanges.faq.after }}</span>
                      </div>
                    </div>
                  </div>

                  <!-- Accept / Discard -->
                  <div class="flex gap-2 pt-1">
                    <button
                      class="flex-1 px-3 py-2 text-xs font-medium rounded-lg bg-brand-500 text-white hover:bg-brand-600 transition-colors"
                      @click="acceptRefinement"
                    >
                      Accept
                    </button>
                    <button
                      class="flex-1 px-3 py-2 text-xs font-medium rounded-lg border border-divider text-content-secondary hover:bg-surface-secondary transition-colors"
                      @click="discardRefinement"
                    >
                      Discard
                    </button>
                  </div>
                </template>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
