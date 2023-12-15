"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchController = void 0;
const common_1 = require("@nestjs/common");
const jwt_guard_1 = require("../auth/Guards/jwt.guard");
const users_repository_1 = require("../modules/users/users.repository");
let SearchController = class SearchController {
    constructor(user) {
        this.user = user;
    }
    async Search(data, req, res) {
        try {
            let users = await this.user.getUserWith(data);
            let searchResult = [];
            if (users) {
                users.forEach((user) => {
                    searchResult.push({
                        id: user.id,
                        username: user.username
                    });
                });
            }
            res.status(200).json(searchResult);
        }
        catch (error) {
            console.log('error while getting search ... call ismail ');
        }
    }
};
exports.SearchController = SearchController;
__decorate([
    (0, common_1.Get)(':data'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuth),
    __param(0, (0, common_1.Param)('data')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], SearchController.prototype, "Search", null);
exports.SearchController = SearchController = __decorate([
    (0, common_1.Controller)('search'),
    __metadata("design:paramtypes", [users_repository_1.UsersRepository])
], SearchController);
//# sourceMappingURL=search.controler.js.map