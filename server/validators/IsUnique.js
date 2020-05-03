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

        const entity = await repository.findOne({ where: { [args.property]: value } });

        if (!entity) {
          return true;
        }

        return entity.id === args.object.id;
      },
    },
  });
};


export default IsUnique;
