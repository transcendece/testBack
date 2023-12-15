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
exports.channelMessageDto = void 0;
const class_validator_1 = require("class-validator");
class channelMessageDto {
}
exports.channelMessageDto = channelMessageDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], channelMessageDto.prototype, "sender", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: "channel name must be a string ." }),
    (0, class_validator_1.MinLength)(1, { message: "need at least one charactere " }),
    (0, class_validator_1.MaxLength)(100, { message: "can't have more the 100 characters each time" }),
    __metadata("design:type", String)
], channelMessageDto.prototype, "content", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: "channel name must be a string ." }),
    (0, class_validator_1.IsNotEmpty)({ message: "channel name is empty ." }),
    (0, class_validator_1.MaxLength)(20, { message: "channel name is too long ." }),
    __metadata("design:type", String)
], channelMessageDto.prototype, "channelName", void 0);
//# sourceMappingURL=channel.messages.dto.js.map