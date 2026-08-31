import Component, { IComponent } from './component.model';

export class ComponentService {
  static async getAllComponents() {
    return await Component.find({});
  }

  static async createComponent(data: Partial<IComponent>) {
    return await Component.create(data);
  }
}