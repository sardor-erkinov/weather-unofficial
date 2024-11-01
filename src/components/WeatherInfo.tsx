import { Flex, Select, Typography } from 'antd'
import { TemperatureTypes, WeatherResponse } from '../types'
import { AxiosError } from 'axios'

export const WeatherInfo = (props: {
  currentWeather?: WeatherResponse
  currentWeatherError: AxiosError<{
    error: { message: string; code: number }
  }> | null
  handleChange: (value: string) => void
  isCelcius: boolean
  temperature: TemperatureTypes
  isLoading: boolean
}) => {
  const {
    currentWeather,
    handleChange,
    isCelcius,
    temperature,
    currentWeatherError,
    isLoading
  } = props

  if (isLoading) {
    return <Typography.Text strong>Loading...</Typography.Text>
  }

  if (currentWeatherError) {
    return (
      <Typography.Text strong style={{ color: 'rgb(229, 0, 0)' }}>
        {currentWeatherError.response?.data.error.message}
      </Typography.Text>
    )
  }

  if (currentWeather) {
    return (
      <>
        <Flex style={{ width: '100%' }} gap={24} justify='center'>
          <Flex
            vertical
            align='right'
            justify='flex-end'
            style={{ width: '100%', textAlign: 'right' }}
            gap={0}
          >
            <Typography.Text strong>
              Country: {currentWeather.location?.country}
            </Typography.Text>
            {currentWeather.location?.region && (
              <Typography.Text strong>
                Region: {currentWeather.location?.region}
              </Typography.Text>
            )}
            <Typography.Text strong>
              Name: {currentWeather.location?.name}
            </Typography.Text>
          </Flex>
          <Flex vertical style={{ width: '100%' }} align='left' gap={0}>
            <Typography.Text strong>
              Current weather:{' '}
              {isCelcius
                ? currentWeather.current?.temp_c
                : currentWeather.current?.temp_f}{' '}
              {temperature}
            </Typography.Text>
            <Typography.Text strong>
              Feels like:{' '}
              {isCelcius
                ? currentWeather.current?.feelslike_c
                : currentWeather.current?.feelslike_f}{' '}
              {temperature}
            </Typography.Text>
            <Typography.Text strong>
              Wind speed: {currentWeather.current?.wind_kph} kilometres per hour
            </Typography.Text>
          </Flex>
        </Flex>
        <Flex vertical gap={6}>
          <label
            style={{ fontSize: '12px', fontWeight: 500 }}
            htmlFor='temperature'
          >
            Select unit of measurement
          </label>
          <Select
            id='temperature'
            defaultValue='celsius'
            style={{ width: 160 }}
            onChange={handleChange}
            options={[
              { value: 'celsius', label: 'Celsius' },
              { value: 'fahrenheit', label: 'Fahrenheit' }
            ]}
          />
        </Flex>
      </>
    )
  }
}
