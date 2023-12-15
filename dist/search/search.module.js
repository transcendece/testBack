"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchModule = void 0;
const common_1 = require("@nestjs/common");
const search_controler_1 = require("./search.controler");
const users_repository_1 = require("../modules/users/users.repository");
const jwt_guard_1 = require("../auth/Guards/jwt.guard");
const prisma_service_1 = require("../modules/database/prisma.service");
const user_service_1 = require("../auth/Services/user.service");
let SearchModule = class SearchModule {
};
exports.SearchModule = SearchModule;
exports.SearchModule = SearchModule = __decorate([
    (0, common_1.Module)({
        providers: [users_repository_1.UsersRepository, jwt_guard_1.JwtAuth, prisma_service_1.PrismaService, user_service_1.UserService],
        controllers: [search_controler_1.SearchController],
    })
], SearchModule);
//# sourceMappingURL=search.module.js.map