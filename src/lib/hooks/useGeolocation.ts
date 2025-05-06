import { useState, useEffect, useCallback } from 'react'

interface GeolocationState {
  location: {
    latitude: number
    longitude: number
  } | null
  error: string | null
  loading: boolean
  isDevelopment: boolean
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    location: null,
    error: null,
    loading: true,
    isDevelopment: process.env.NODE_ENV === 'development'
  })

  const getLocation = useCallback(() => {
    setState(prev => ({ ...prev, loading: true, error: null }))

    // Em ambiente de desenvolvimento, não requer geolocalização
    if (state.isDevelopment) {
      setState(prev => ({
        ...prev,
        location: null,
        error: null,
        loading: false
      }))
      return
    }

    if (!navigator.geolocation) {
      setState(prev => ({
        ...prev,
        error: 'Geolocalização não é suportada pelo seu navegador',
        loading: false,
      }))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          location: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          },
          error: null,
          loading: false,
          isDevelopment: state.isDevelopment
        })
      },
      (error) => {
        let errorMessage = 'Erro ao obter localização'
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Permissão de localização negada. Por favor, permita o acesso nas configurações do navegador.'
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Localização indisponível. Tente novamente.'
            break
          case error.TIMEOUT:
            errorMessage = 'Tempo de solicitação de localização excedido. Tente novamente.'
            break
        }

        setState({
          location: null,
          error: errorMessage,
          loading: false,
          isDevelopment: state.isDevelopment
        })
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    )
  }, [state.isDevelopment])

  useEffect(() => {
    getLocation()
  }, [getLocation])

  return {
    ...state,
    retry: getLocation
  }
} 