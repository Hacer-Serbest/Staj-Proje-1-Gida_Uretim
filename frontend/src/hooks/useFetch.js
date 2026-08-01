import { useCallback, useEffect, useState } from 'react';

/**
 * axios tabanlı bir istek fonksiyonunu çalıştırır, sonucu/yükleniyor/hata durumunu yönetir.
 * @param {() => Promise<import('axios').AxiosResponse>} requestFn
 * @param {Array} deps - requestFn'in yeniden çalışmasını tetikleyecek bağımlılıklar
 */
const useFetch = (requestFn, deps = []) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const refetch = useCallback(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    requestFn()
      .then((res) => {
        if (!cancelled) setData(res.data.data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.response?.data?.message || 'Bir hata oluştu.');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, deps);

  useEffect(() => refetch(), [refetch]);

  return { data, error, isLoading, refetch };
};

export default useFetch;
