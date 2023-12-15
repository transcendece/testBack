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
exports.TwoFAConroller = void 0;
const common_1 = require("@nestjs/common");
const user_dto_1 = require("../../DTOs/User/user.dto");
const jwt_guard_1 = require("../Guards/jwt.guard");
const _2FA_service_1 = require("../Services/2FA.service");
const user_service_1 = require("../Services/user.service");
let TwoFAConroller = class TwoFAConroller {
    constructor(TwoFAService, userService) {
        this.TwoFAService = TwoFAService;
        this.userService = userService;
    }
    async register(response, req) {
        try {
            const user = req.user;
            const code = await this.TwoFAService.generate2FASecret(user);
            response.status(200).json({ code });
        }
        catch (error) {
            response.status(400).json(error);
        }
    }
    async validate2FA(req, body, res) {
        const user = req.user;
        const id = user.id;
        const Pin = body.code;
        console.log(body);
        console.log("pin : ", Pin);
        console.log("ZEBIIII", body.code);
        console.log(`hello : ${body.code}, hello : ${id}`);
        try {
            const user = await this.userService.getUser(id);
            const isValid = await this.TwoFAService.TwoFACodeValidation(Pin, user.TwoFASecret);
            if (!isValid)
                res.status(401).send('invalid otp, try again.');
            else {
                res.status(200).json(user);
            }
        }
        catch (error) {
            res.status(401).json(error);
        }
    }
};
exports.TwoFAConroller = TwoFAConroller;
__decorate([
    (0, common_1.Post)('generate'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuth),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], TwoFAConroller.prototype, "register", null);
__decorate([
    (0, common_1.Post)('validation'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuth),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, user_dto_1.TwoFaV, Object]),
    __metadata("design:returntype", Promise)
], TwoFAConroller.prototype, "validate2FA", null);
exports.TwoFAConroller = TwoFAConroller = __decorate([
    (0, common_1.Controller)('2FA'),
    __metadata("design:paramtypes", [_2FA_service_1.TwoFAService, user_service_1.UserService])
], TwoFAConroller);
//# sourceMappingURL=2FA.controller.js.map