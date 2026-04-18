<script setup lang="ts">
    import type {
        BlogPostStatus,
        IAffiliate,
        IAuthor,
        IBlogPost,
        ICategory,
        IFaqItem,
    } from "@tiny-tools/shared";
    import { Check, ChevronDown, ChevronUp, Copy, Plus, Share2, Sparkles, Trash2 } from "lucide-vue-next";

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
    const shareOpen = ref(false);
    const instagramCopied = ref(false);
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

    const selectedCategory = computed(() => categories.value.find((c) => c._id === form.category));

    const postUrl = computed(() => {
        const config = useRuntimeConfig();
        const base = (config.public.siteUrl as string).replace(/\/$/, "");
        if (!form.slug || !selectedCategory.value?.slug || form.status !== "published") return "";
        return `${base}/blog/${selectedCategory.value.slug}/${form.slug}`;
    });

    function shareOn(platform: "facebook" | "x" | "linkedin") {
        const url = postUrl.value;
        if (!url) return;
        const urls = {
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
            x: `https://twitter.com/intent/tweet?text=${encodeURIComponent(form.title)}&url=${encodeURIComponent(url)}`,
            linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
        };
        window.open(urls[platform], "_blank", "width=600,height=500,noopener,noreferrer");
    }

    async function copyForInstagram() {
        const text = `${form.title}\n\n${form.excerpt}\n\n${postUrl.value}`;
        await navigator.clipboard.writeText(text);
        instagramCopied.value = true;
        setTimeout(() => { instagramCopied.value = false; }, 2000);
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

          <!-- Share on Social Media -->
          <div class="bg-surface border border-surface-border rounded-xl overflow-hidden">
            <button
              class="w-full flex items-center justify-between px-5 py-4 text-sm font-semibold text-content hover:bg-surface-secondary transition-colors"
              @click="shareOpen = !shareOpen"
            >
              <span class="flex items-center gap-2">
                <Share2 :size="15" class="text-content-muted" />
                Share
              </span>
              <component :is="shareOpen ? ChevronUp : ChevronDown" :size="16" class="text-content-muted" />
            </button>

            <div v-if="shareOpen" class="border-t border-surface-border px-5 pb-5 pt-4 space-y-3">
              <div v-if="!postUrl" class="text-xs text-content-muted">
                Post must be <strong>published</strong> with a category and slug to share.
              </div>
              <template v-else>
                <!-- Facebook -->
                <button
                  class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white transition-colors"
                  style="background-color: #1877f2;"
                  @click="shareOn('facebook')"
                >
                  <svg class="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Share on Facebook
                </button>

                <!-- X -->
                <button
                  class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white transition-colors bg-black hover:bg-gray-900"
                  @click="shareOn('x')"
                >
                  <svg class="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  Share on X
                </button>

                <!-- LinkedIn -->
                <button
                  class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white transition-colors"
                  style="background-color: #0a66c2;"
                  @click="shareOn('linkedin')"
                >
                  <svg class="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  Share on LinkedIn
                </button>

                <!-- Instagram (copy) -->
                <button
                  class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white transition-colors"
                  style="background: linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888);"
                  @click="copyForInstagram"
                >
                  <svg class="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                  <component :is="instagramCopied ? Check : Copy" :size="14" class="ml-auto shrink-0" />
                  {{ instagramCopied ? 'Copied!' : 'Copy for Instagram' }}
                </button>
                <p class="text-xs text-content-muted">Instagram copies title, excerpt &amp; URL to your clipboard.</p>
              </template>
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
