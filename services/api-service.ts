import axios from 'axios';
import useSWR from 'swr';

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

export const useData = <T>(url: string | null) => {
  const { data, error, mutate, isLoading } = useSWR<T>(url, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000, // 1 minute cache for performance
  });

  return {
    data,
    isLoading,
    isError: error,
    mutate,
  };
};

export const aiService = {
  async askGemini(prompt: string, context?: any) {
    const response = await axios.post('/api/gemini', { prompt, context });
    return response.data.text;
  }
};
