import { Injectable } from "../../core/decorators";

@Injectable()
export class LoggerService {
  log(message: string) {
    console.log(`📫 [Logger]: ${message}`);
  }
}