export interface TankInfo {
  timestamp?: Date;
  productLevel?: number;
  tov?: number;
  productVolume?: number;
  nsv?: number;
  volumeSpeed?: number;
  mass?: number;
  density15?: number;
  densityCurrent?: number;
  productTemperature?: number;
  sedimentLevel?: number;
  sedimentVolume?: number;
  vaporMass?: number;
  liquidMass?: number;
  vaporVolume?: number;
  liquidVolume?: number;
  vaporTemperature?: number;
  liquidTemperature?: number;
  massVacuume?: number;
  pressure?: number;
  t1?: number;
  t2?: number;
  t3?: number;
  t4?: number;
  t5?: number;
  t6?: number;
  t7?: number;
}

export interface TankInfoExtended extends TankInfo {
  tankName: string;
  status: "error" | "warning" | "normal" | "active" | "inactive";
  park?: string;
  product?: string;
  levelPercent?: number;
  volumePercent?: number;
  freeVolume?: number;
  timeleft?: string;
  description?: string;
  massSpeed?: number;
}

export interface TankInfoWithGrouping extends TankInfo {
  subRows?: TankInfo[];
}

export interface TankInfoExtendedWithGrouping extends TankInfoExtended {
  id: string;
  subRows?: TankInfoExtended[];
}

export interface GasContent {
  name: string;
  datetime: string;
  ethane: number;
  propane: number;
  butane: number;
  pentane: number;
}
