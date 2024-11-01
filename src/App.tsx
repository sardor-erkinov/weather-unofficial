import { useDeferredValue, useEffect, useMemo, useState } from 'react'
import './App.css'
import { AutoComplete, Flex, message, Typography } from 'antd'
import { useQuery } from '@tanstack/react-query'
import {
  Location,
  LocationOption,
  ResponseError,
  TemperatureTypes,
  WeatherResponse
} from './types'
import axios, { AxiosError, AxiosResponse } from 'axios'
import { WeatherInfo } from './components/WeatherInfo'

function App () {
  const [query, setQuery] = useState('')
  const deferredQuery = useDeferredValue(query)
  const [location, setLocation] = useState<LocationOption>()
  const [recentLocations, setRecentLocations] = useState<LocationOption[]>([])
  const [temperature, setTemperature] = useState<'celsius' | 'fahrenheit'>(
    'celsius'
  )

  const onSelect = (_data: string, location: LocationOption) => {
    // console.log('onSelect', data, location)
    setLocation(location)
  }

  const onSearch = (text: string) => {
    // console.log({ text })
    if (location) {
      setLocation(undefined)
    }
    setQuery(text)
  }

  const updateRecentLocations = (location: LocationOption) => {
    const newLocations = [...recentLocations]
    if (newLocations.length >= 5) {
      newLocations.shift()
    }
    if (!newLocations.find(oldLocation => oldLocation.id === location.id)) {
      newLocations.push(location)
      setRecentLocations(newLocations)
    }
  }

  useEffect(() => {
    if (location) {
      updateRecentLocations(location)
    }
  }, [location])

  const isCelcius = useMemo(() => temperature === 'celsius', [temperature])

  const { error, data } = useQuery<
    AxiosResponse<Location[]>,
    AxiosError<ResponseError>
  >({
    queryKey: ['weather', deferredQuery],
    queryFn: () =>
      axios.get(
        'https://api.weatherapi.com/v1/search.json?key=bb6cfedb4c0c4a28afb173405243010&q=' +
          deferredQuery
      ),
    enabled: !!deferredQuery
  })

  const handleChange = (value: string) => {
    setTemperature(value as TemperatureTypes)
  }

  const {
    error: currentWeatherError,
    data: currentWeather,
    isLoading
  } = useQuery<AxiosResponse<WeatherResponse>, AxiosError<ResponseError>>({
    queryKey: ['currentWeather', deferredQuery, location?.id],
    queryFn: async () => {
      return await axios.get(
        'https://api.weatherapi.com/v1/current.json?key=bb6cfedb4c0c4a28afb173405243010&q=' +
          (location?.id ? `id:${location?.id}` : `${deferredQuery}&api=no`)
      )
    },
    enabled: !!location || !!deferredQuery
  })

  useEffect(() => {
    if (error?.response?.data?.error?.message) {
      message.error(
        'An error has occurred: ' + error?.response?.data.error.message
      )
    }
  }, [error?.response?.data?.error?.message])

  const options: LocationOption[] = useMemo(() => {
    if (data?.data) {
      return data.data.map(location => ({
        value: `${location.name} ${location.country} ${location.region} ${location.id}`,
        id: location.id,
        lat: location.lat,
        lon: location.lon
      }))
    } else {
      if (!deferredQuery) {
        return recentLocations
      } else {
        return []
      }
    }
  }, [data?.data])

  return (
    <main style={{ width: '100vw' }}>
      <Flex vertical align='center' gap={12}>
        <Typography.Title level={1}>Weather unofficial</Typography.Title>
        <AutoComplete
          options={options}
          style={{ width: 260 }}
          onSelect={onSelect}
          allowClear
          onClear={() => {
            setLocation(undefined)
          }}
          onSearch={onSearch}
          placeholder='Enter your location'
          status={error ? 'error' : undefined}
        />
        <WeatherInfo
          currentWeather={currentWeather?.data}
          currentWeatherError={currentWeatherError}
          handleChange={handleChange}
          isCelcius={isCelcius}
          temperature={temperature}
          isLoading={isLoading}
        />
      </Flex>
    </main>
  )
}

export default App
