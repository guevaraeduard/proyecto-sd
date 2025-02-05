export interface ListVehicle {
  id: string
  data: DataUser
  time: number
}

export interface DataUser {
  id: string
  name: string
  direction: 'Derecha' | 'Izquierda'
  speed: number
  delay: number
}
