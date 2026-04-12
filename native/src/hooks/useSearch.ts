import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import useLocations from './getLocation'

const UseSearch = () => {

  const {coords, loading} = useLocations()

}

export default UseSearch

const styles = StyleSheet.create({})