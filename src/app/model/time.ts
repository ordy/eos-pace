export interface Time {	
  abbreviation?: string;
  client_ip?: string;
  datetime:	string;
  day_of_week: string;
  day_of_year?: number;
  dst?: boolean;
  dst_from?:	string;
  dst_offset?:	number;
  dst_until?: string;
  raw_offset?:	number;
  timezone?:	string;
  unixtime?:	number;
  utc_datetime?:	string;
  utc_offset?:	string;
  week_number: number;
}