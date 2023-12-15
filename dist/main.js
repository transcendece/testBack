"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const cookieParser = require("cookie-parser");
const validator_1 = require("./DTOs/validator");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.use(cookieParser());
    app.useGlobalFilters(new validator_1.ValidationExceptionFilter());
    app.enableCors({
        origin: ["http://localhost:3000"],
        credentials: true
    });
    await app.listen(4000);
}
bootstrap();
//# sourceMappingURL=main.js.map