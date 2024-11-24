import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import { useToast } from '@/components/ui/toast/use-toast'; // Certifique-se de ter essa dependência configurada

export const useNotificationStore = defineStore('notification', () => {
  const { toast } = useToast();

  const _message = ref('');
  const _title = ref('');

  const message = computed(() => {
    return _message.value.trim();
  });

  const title = computed(() => {
    return _title.value.trim();
  });

  const resetMessages = () => {
    _message.value = '';
    _title.value = '';
  };

  const setSuccessMessage = (mainMessage, titleMessage = 'Success') => {
    _message.value = mainMessage;
    _title.value = titleMessage;

    toast({
      title: titleMessage,
      description: mainMessage,
      variant: 'success', // Verde ou positivo
    });
  };

  return {
    message,
    title,
    resetMessages,
    setSuccessMessage,
  };
});
