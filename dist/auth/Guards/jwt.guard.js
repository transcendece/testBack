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
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtAuth = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const user_service_1 = require("../Services/user.service");
let JwtAuth = class JwtAuth {
    constructor(jwtService, userService) {
        this.jwtService = jwtService;
        this.userService = userService;
    }
    async canActivate(context) {
        try {
            var request = context.switchToHttp().getRequest();
            var token = this.extractTokenFromHeader(request);
            var payload = this.jwtService.verify(token);
            if (!token)
                return false;
            const user = await this.userService.getUser(payload.sub);
            if (!user) {
                return false;
            }
            request.user = user;
            return true;
        }
        catch (error) {
            throw new common_1.UnauthorizedException('sir awldi, 7na kanla3bo hna');
        }
    }
    extractTokenFromHeader(req) {
        return req.cookies['jwt-token'];
    }
};
exports.JwtAuth = JwtAuth;
exports.JwtAuth = JwtAuth = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService, user_service_1.UserService])
], JwtAuth);
//# sourceMappingURL=jwt.guard.js.map