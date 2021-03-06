import { Model, Types } from "mongoose";
import { LoggerService } from "../../Middleware/Logger";

export interface IBaseModelParamsInterface {
  options?: any;

  [propName: string]: any;
}

export interface IBaseModelCtxInterface {
  page?: number;
  perPage?: number;
  sortBy?: string;
  sortType?: number;

  [propName: string]: any;
}

export abstract class BaseModel {
  private readonly model: Model<any>;
  private readonly type: any;
  private readonly logger: LoggerService;

  protected constructor(data: any, type: any) {
    this.model = data;
    this.type = type;
    this.logger = new LoggerService();
  }

  /**
   * This function creates and store values in the database
   * @param values
   */

  public async create(values: any): Promise<any> {
    try {
      const object = new this.model(values);
      const data = await object.save();
      console.log("parent", data);
      return data;
    } catch (error) {
      this.logger.error(`${this.model.modelName}.create Failed. Error Details :  ${error}`);
      throw error;
    }
  }

  /**
   * Get Model information by Id
   * @param id
   * @return Model<any>
   */
  public async get(id: string): Promise<any> {
    try {
      let model;

      if (Types.ObjectId.isValid(id)) {
        model = await this.model.findById(id).exec();
      }
      if (model) {
        return model;
      }
      throw new Error(
        `ID: ${id} for model ${this.model.modelName} not found`
      );
    } catch (error) {
      throw error;
    }
  }

  /**
   * List Model in descending order of 'createdAt' timestamp.
   *
   * @returns {Promise<Model[]>}
   * @param params
   * @param ctx
   */
  public list(
    params: IBaseModelParamsInterface = {},
    ctx: IBaseModelCtxInterface = { sortBy: "createdAt", sortType: -1, perPage: 30, page: 1 }
  ): any {
    try {
      this.logger.info(`${this.model.modelName}.list params=${params} ctx=${ctx}`);
      const { perPage, page, sortBy, sortType } = ctx;
      return this.model.find(params)
        .sort({ [sortBy]: sortType })
        .skip(perPage * (page - 1))
        .limit(perPage)
        .exec();
    } catch (error) {
      this.logger.error(`${this.model.modelName}.list Failed. Error Details :  ${error}`);
      throw error;
    }
  }

  /**
   * Delete user
   * @public
   */
  public async delete(id: string): Promise<void> {
    try {
      this.logger.info(`${this.model.modelName}.delete id=${id}`);
      let model;

      if (Types.ObjectId.isValid(id)) {
        model = await this.model.findById(id).exec();
      }
      if (model) {
        return model.remove();
      }
      throw new Error(
        `ID: ${id} for model ${this.model.modelName} not found`
      );
    } catch (error) {
      this.logger.error(`${this.model.modelName}.delete id=${id} Failed. Error Details :  ${error}`);
      throw error;
    }
  }
}
