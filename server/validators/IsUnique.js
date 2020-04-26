import { getRepository } from 'typeorm';
import { registerDecorator } from 'class-validator';

const IsUnique = (validationOptions) => (object, propertyName) => {
  registerDecorator({
    target: object.constructor,
    propertyName,
    options: validationOptions,
    constraints: [],
    validator: {
      async validate(value, args) {
        const repository = getRepository(args.targetName);

        if (args.object.id !== null) {
          return true;
        }

        const entity = await repository.findOne({ where: { [args.property]: value } });

        return !entity;
      },
    },
  });
};


export default IsUnique;
