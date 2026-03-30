<script setup lang="ts">
import { MdEditor } from 'md-editor-v3';
import 'md-editor-v3/lib/style.css';

const model = defineModel<string>({ required: true });

defineProps<{
  placeholder?: string;
}>();

const colorMode = useColorMode();
const theme = computed(() => (colorMode.value === 'dark' ? 'dark' : 'light'));
</script>

<template>
  <MdEditor
    v-model="model"
    language="en-US"
    :theme="theme"
    :placeholder="placeholder"
    :preview="false"
    :style="{ height: '460px' }"
    :toolbars="[
      'bold', 'underline', 'italic', 'strikeThrough',
      '-',
      'title', 'sub', 'sup', 'quote', 'unorderedList', 'orderedList', 'task',
      '-',
      'codeRow', 'code', 'link', 'image', 'table',
      '-',
      'revoke', 'next',
      '=',
      'preview', 'fullscreen',
    ]"
  />
</template>
