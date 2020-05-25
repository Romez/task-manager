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
        const repository = getRepository(args.targetName, process.env.NODE_ENV);

        const entity = await repository.findOne({ [args.property]: value, deletedAt: null });

        if (!entity) {
          return true;
        }

        return entity.id === args.object.id;
      },
    },
  });
};

export default IsUnique;
