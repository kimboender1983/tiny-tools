<script setup lang="ts">
    import { Check, Key, Pencil, Plus, Shield, Trash2, X } from "lucide-vue-next";

    definePageMeta({ layout: "admin", middleware: ["admin"] });

    interface AdminUser {
        _id: string;
        email: string;
        name?: string;
        role: string;
        plan: string;
        avatar?: string;
        createdAt: string;
        updatedAt: string;
    }

    const cms = useCms();
    const toast = useToast();

    const loading = ref(true);
    const error = ref("");
    const users = ref<AdminUser[]>([]);
    const deleteConfirmId = ref<string | null>(null);
    const editingId = ref<string | null>(null);
    const passwordChangeId = ref<string | null>(null);

    // New user form
    const showAddForm = ref(false);
    const newForm = reactive({
        email: "",
        password: "",
        name: "",
        role: "admin",
    });

    // Edit form
    const editForm = reactive({
        email: "",
        name: "",
        role: "",
    });

    // Password form
    const passwordForm = reactive({
        password: "",
        confirm: "",
    });
    const passwordError = ref("");
    const passwordSuccess = ref("");

    async function loadUsers() {
        loading.value = true;
        error.value = "";
        try {
            users.value = await cms.users.list();
        } catch (e: unknown) {
            error.value = e instanceof Error ? e.message : "Failed to load users.";
        } finally {
            loading.value = false;
        }
    }

    async function createUser() {
        if (!newForm.email || !newForm.password) return;
        if (newForm.password.length < 8) {
            error.value = "Password must be at least 8 characters.";
            return;
        }
        error.value = "";
        try {
            await cms.users.create({
                email: newForm.email,
                password: newForm.password,
                name: newForm.name || undefined,
                role: newForm.role,
            });
            newForm.email = "";
            newForm.password = "";
            newForm.name = "";
            newForm.role = "admin";
            showAddForm.value = false;
            toast.success("User created");
            await loadUsers();
        } catch (e: unknown) {
            toast.error(e instanceof Error ? e.message : "Failed to create user.");
        }
    }

    function startEdit(user: AdminUser) {
        editingId.value = user._id;
        editForm.email = user.email;
        editForm.name = user.name || "";
        editForm.role = user.role;
    }

    function cancelEdit() {
        editingId.value = null;
    }

    async function saveEdit(id: string) {
        error.value = "";
        try {
            await cms.users.update(id, {
                email: editForm.email,
                name: editForm.name || undefined,
                role: editForm.role,
            });
            editingId.value = null;
            toast.success("User updated");
            await loadUsers();
        } catch (e: unknown) {
            toast.error(e instanceof Error ? e.message : "Failed to update user.");
        }
    }

    function startPasswordChange(id: string) {
        passwordChangeId.value = id;
        passwordForm.password = "";
        passwordForm.confirm = "";
        passwordError.value = "";
        passwordSuccess.value = "";
    }

    async function savePassword(id: string) {
        passwordError.value = "";
        passwordSuccess.value = "";

        if (passwordForm.password.length < 8) {
            passwordError.value = "Password must be at least 8 characters.";
            return;
        }
        if (passwordForm.password !== passwordForm.confirm) {
            passwordError.value = "Passwords do not match.";
            return;
        }

        try {
            await cms.users.changePassword(id, passwordForm.password);
            toast.success("Password updated");
            passwordForm.password = "";
            passwordForm.confirm = "";
            setTimeout(() => {
                passwordChangeId.value = null;
            }, 1500);
        } catch (e: unknown) {
            toast.error(e instanceof Error ? e.message : "Failed to change password.");
        }
    }

    async function deleteUser(id: string) {
        error.value = "";
        try {
            await cms.users.delete(id);
            deleteConfirmId.value = null;
            toast.success("User deleted");
            await loadUsers();
        } catch (e: unknown) {
            toast.error(e instanceof Error ? e.message : "Failed to delete user.");
        }
    }

    function formatDate(date: string): string {
        return new Date(date).toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    }

    onMounted(loadUsers);
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-content">Users</h1>
      <button
        v-if="!showAddForm"
        class="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg bg-brand-500 text-white hover:bg-brand-600 transition-colors"
        @click="showAddForm = true"
      >
        <Plus :size="16" />
        Add User
      </button>
    </div>

    <div v-if="error" class="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
      {{ error }}
    </div>

    <div class="bg-surface border border-surface-border rounded-xl overflow-hidden">
      <!-- Add new form -->
      <div v-if="showAddForm" class="px-4 py-3 bg-surface-secondary border-b border-surface-border">
        <form class="flex items-end gap-3 flex-wrap" @submit.prevent="createUser">
          <div class="flex-1 min-w-[180px]">
            <label class="block text-xs font-medium text-content-muted mb-1">Email</label>
            <input
              v-model="newForm.email"
              type="email"
              required
              class="w-full px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-900 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
              placeholder="user@example.com"
            />
          </div>
          <div class="flex-1 min-w-[180px]">
            <label class="block text-xs font-medium text-content-muted mb-1">Password</label>
            <input
              v-model="newForm.password"
              type="password"
              required
              minlength="8"
              class="w-full px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-900 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
              placeholder="Min. 8 characters"
            />
          </div>
          <div class="w-40">
            <label class="block text-xs font-medium text-content-muted mb-1">Name</label>
            <input
              v-model="newForm.name"
              type="text"
              class="w-full px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-900 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
              placeholder="Optional"
            />
          </div>
          <div class="w-28">
            <label class="block text-xs font-medium text-content-muted mb-1">Role</label>
            <select
              v-model="newForm.role"
              class="w-full px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-900 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
            >
              <option value="admin">Admin</option>
              <option value="editor">Editor</option>
            </select>
          </div>
          <div class="flex gap-1">
            <button type="submit" class="p-1.5 rounded-lg bg-brand-500 text-white hover:bg-brand-600 transition-colors">
              <Check :size="16" />
            </button>
            <button
              type="button"
              class="p-1.5 rounded-lg border border-divider text-content-tertiary hover:bg-surface-secondary transition-colors"
              @click="showAddForm = false"
            >
              <X :size="16" />
            </button>
          </div>
        </form>
      </div>

      <!-- Table -->
      <div v-if="loading" class="p-8 text-center text-sm text-content-muted">Loading...</div>
      <div v-else-if="users.length === 0 && !showAddForm" class="p-8 text-center text-sm text-content-muted">No users yet.</div>
      <table v-else-if="users.length > 0" class="w-full text-sm">
        <thead>
          <tr class="border-b border-surface-border text-left">
            <th class="px-4 py-3 font-medium text-content-muted">Email</th>
            <th class="px-4 py-3 font-medium text-content-muted">Name</th>
            <th class="px-4 py-3 font-medium text-content-muted w-24">Role</th>
            <th class="px-4 py-3 font-medium text-content-muted w-28">Created</th>
            <th class="px-4 py-3 font-medium text-content-muted w-32">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-surface-border">
          <template v-for="user in users" :key="user._id">
            <tr>
              <!-- Display mode -->
              <template v-if="editingId !== user._id">
                <td class="px-4 py-3 font-medium text-content">{{ user.email }}</td>
                <td class="px-4 py-3 text-content-muted">{{ user.name || '—' }}</td>
                <td class="px-4 py-3">
                  <span
                    class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                    :class="user.role === 'admin'
                      ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/20 dark:text-brand-400'
                      : 'bg-surface-secondary text-content-tertiary'"
                  >
                    <Shield v-if="user.role === 'admin'" :size="10" />
                    {{ user.role }}
                  </span>
                </td>
                <td class="px-4 py-3 text-content-muted text-xs">{{ formatDate(user.createdAt) }}</td>
                <td class="px-4 py-3">
                  <div v-if="deleteConfirmId !== user._id" class="flex items-center gap-1">
                    <button
                      class="p-1 text-gray-500 hover:text-brand-500 transition-colors"
                      title="Edit"
                      @click="startEdit(user)"
                    >
                      <Pencil :size="14" />
                    </button>
                    <button
                      class="p-1 text-gray-500 hover:text-amber-500 transition-colors"
                      title="Change password"
                      @click="startPasswordChange(user._id)"
                    >
                      <Key :size="14" />
                    </button>
                    <button
                      class="p-1 text-gray-500 hover:text-red-500 transition-colors"
                      title="Delete"
                      @click="deleteConfirmId = user._id"
                    >
                      <Trash2 :size="14" />
                    </button>
                  </div>
                  <div v-else class="flex items-center gap-1">
                    <button
                      class="px-2 py-0.5 text-xs rounded bg-red-500 text-white hover:bg-red-600"
                      @click="deleteUser(user._id)"
                    >
                      Delete
                    </button>
                    <button
                      class="px-2 py-0.5 text-xs rounded border border-divider text-content-tertiary hover:bg-surface-secondary"
                      @click="deleteConfirmId = null"
                    >
                      Cancel
                    </button>
                  </div>
                </td>
              </template>

              <!-- Edit mode -->
              <template v-else>
                <td class="px-4 py-2">
                  <input
                    v-model="editForm.email"
                    type="email"
                    class="w-full px-2 py-1 rounded border border-gray-300 bg-white text-gray-900 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                  />
                </td>
                <td class="px-4 py-2">
                  <input
                    v-model="editForm.name"
                    type="text"
                    class="w-full px-2 py-1 rounded border border-gray-300 bg-white text-gray-900 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                  />
                </td>
                <td class="px-4 py-2">
                  <select
                    v-model="editForm.role"
                    class="w-full px-2 py-1 rounded border border-gray-300 bg-white text-gray-900 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                  >
                    <option value="admin">admin</option>
                    <option value="editor">editor</option>
                  </select>
                </td>
                <td class="px-4 py-2 text-xs text-gray-400">—</td>
                <td class="px-4 py-2">
                  <div class="flex items-center gap-1">
                    <button class="p-1 text-green-600 hover:text-green-700 transition-colors" title="Save" @click="saveEdit(user._id)">
                      <Check :size="16" />
                    </button>
                    <button class="p-1 text-gray-500 hover:text-gray-600 transition-colors" title="Cancel" @click="cancelEdit">
                      <X :size="16" />
                    </button>
                  </div>
                </td>
              </template>
            </tr>

            <!-- Password change row -->
            <tr v-if="passwordChangeId === user._id">
              <td colspan="5" class="px-4 py-3 bg-amber-50 dark:bg-amber-900/10 border-t border-amber-200 dark:border-amber-900/30">
                <form class="flex items-end gap-3 flex-wrap" @submit.prevent="savePassword(user._id)">
                  <div class="flex items-center gap-2 text-sm font-medium text-amber-700 dark:text-amber-400">
                    <Key :size="14" />
                    Change password for {{ user.email }}
                  </div>
                  <div class="flex-1 min-w-[160px]">
                    <input
                      v-model="passwordForm.password"
                      type="password"
                      required
                      minlength="8"
                      class="w-full px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-900 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                      placeholder="New password"
                    />
                  </div>
                  <div class="flex-1 min-w-[160px]">
                    <input
                      v-model="passwordForm.confirm"
                      type="password"
                      required
                      minlength="8"
                      class="w-full px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-900 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                      placeholder="Confirm password"
                    />
                  </div>
                  <div class="flex items-center gap-2">
                    <button type="submit" class="px-3 py-1.5 text-xs font-medium rounded-lg bg-amber-500 text-white hover:bg-amber-600 transition-colors">
                      Save
                    </button>
                    <button
                      type="button"
                      class="px-3 py-1.5 text-xs font-medium rounded-lg border border-divider text-content-tertiary hover:bg-surface-secondary transition-colors"
                      @click="passwordChangeId = null"
                    >
                      Cancel
                    </button>
                  </div>
                  <span v-if="passwordError" class="text-xs text-red-600 dark:text-red-400">{{ passwordError }}</span>
                  <span v-if="passwordSuccess" class="text-xs text-green-600 dark:text-green-400">{{ passwordSuccess }}</span>
                </form>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </div>
</template>
