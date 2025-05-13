import { IQuotes } from '@core/interfaces/common.model';
import {
  AboutUs,
  Counter,
  Feature,
  Offer,
} from '../../home/res/home.interfaces';

export interface IAboutUsOne {
  counters: Counter[];
  breaks: IQuotes[];
  offers: Offer[];
}

export interface IAboutUsTwo {
  faqs: IFaq[];
  aboutdata: AboutUs;
  features: Feature[];
}

export interface IFaq {
  id: number;
  en_title: string;
  ar_title: string;
  en_text: string;
  ar_text: string;
  active_status: number;
  created_at: string;
  updated_at: string;
}
