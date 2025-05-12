import { IQuotes } from '@core/interfaces/common.model';
import {
  AboutUs,
  Counter,
  Feature,
  Offer,
} from '../../home/res/home.interfaces';

export interface IAboutUs {
  aboutUs: AboutUs;
  features: Feature[];
  counters: Counter[];
  breaks: IQuotes[];
  offers: Offer[];
}
