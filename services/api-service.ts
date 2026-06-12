import useSWR from 'swr';

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('An error occurred while fetching the data.');
  }
  return res.json();
};

export const useData = <T,>(url: string | null) => {
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
    const response = await fetch('/api/gemini', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt, context }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to fetch from Gemini API');
    }

    const data = await response.json();
    return data.text;
  }
};
