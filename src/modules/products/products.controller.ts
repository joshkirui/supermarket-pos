import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import {
  CreateProductDto,
  UpdateProductDto,
  CreateVariantDto,
  ProductQueryDto,
} from './dto/product.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';

@ApiTags('Products')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Get()
  @RequirePermissions('product.view')
  findAll(@Query() query: ProductQueryDto) {
    return this.productsService.findAll(query);
  }

  @Get('scan/:barcode')
  @RequirePermissions('product.view')
  findByBarcode(@Param('barcode') barcode: string) {
    return this.productsService.findByBarcode(barcode);
  }

  @Get(':id')
  @RequirePermissions('product.view')
  findById(@Param('id') id: string) {
    return this.productsService.findById(id);
  }

  @Post()
  @RequirePermissions('product.create')
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @Put(':id')
  @RequirePermissions('product.update')
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto);
  }

  @Post(':id/variants')
  @RequirePermissions('product.create')
  addVariant(@Param('id') id: string, @Body() dto: CreateVariantDto) {
    return this.productsService.addVariant(id, dto);
  }

  @Post('categories')
  @RequirePermissions('product.create')
  createCategory(
    @Body('name') name: string,
    @Body('parentId') parentId?: string,
  ) {
    return this.productsService.createCategory(name, parentId);
  }

  @Post('brands')
  @RequirePermissions('product.create')
  createBrand(@Body('name') name: string) {
    return this.productsService.createBrand(name);
  }
}
