import { useCallback, useEffect, useState } from 'react'

export function useAsyncList(fetcher) {
  const [data, setData] = useState(undefined)
  const [version, setVersion] = useState(0)

  const refetch = useCallback(() => setVersion((v) => v + 1), [])

  useEffect(() => {
    let cancelled = false
    fetcher().then((d) => {
      if (!cancelled) setData(d)
    })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version])

  return [data, refetch]
}
