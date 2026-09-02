import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import {
  CreateProductDto,
  UpdateProductDto,
  CreateVariantDto,
  ProductQueryDto,
} from './dto/product.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: ProductQueryDto) {
    const { search, categoryId, brandId, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where: any = { isActive: true };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { variants: { some: { barcode: { contains: search } } } },
      ];
    }

    if (categoryId) where.categoryId = categoryId;
    if (brandId) where.brandId = brandId;

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: {
          category: true,
          brand: true,
          variants: { where: { isActive: true } },
        },
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data: products,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findById(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        brand: true,
        variants: { where: { isActive: true } },
      },
    });

    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async findByBarcode(barcode: string) {
    const variant = await this.prisma.productVariant.findUnique({
      where: { barcode },
      include: {
        product: {
          include: { category: true, brand: true },
        },
      },
    });

    if (!variant) throw new NotFoundException('Product not found for barcode');
    return variant;
  }

  async create(dto: CreateProductDto) {
    const existing = await this.prisma.product.findUnique({
      where: { sku: dto.sku },
    });

    if (existing) {
      throw new ConflictException(`Product with SKU "${dto.sku}" already exists`);
    }

    return this.prisma.product.create({
      data: {
        sku: dto.sku,
        name: dto.name,
        categoryId: dto.categoryId,
        brandId: dto.brandId,
        unitOfMeasure: dto.unitOfMeasure,
        isWeighable: dto.isWeighable,
        taxRate: dto.taxRate,
      },
      include: { category: true, brand: true },
    });
  }

  async update(id: string, dto: UpdateProductDto) {
    await this.findById(id);
    return this.prisma.product.update({
      where: { id },
      data: dto,
      include: { category: true, brand: true },
    });
  }

  async addVariant(productId: string, dto: CreateVariantDto) {
    await this.findById(productId);

    if (dto.barcode) {
      const existing = await this.prisma.productVariant.findUnique({
        where: { barcode: dto.barcode },
      });
      if (existing) {
        throw new ConflictException(`Barcode "${dto.barcode}" already exists`);
      }
    }

    return this.prisma.productVariant.create({
      data: {
        productId,
        barcode: dto.barcode,
        variantName: dto.variantName,
        price: dto.price,
        costPrice: dto.costPrice || 0,
        stockQuantity: dto.stockQuantity || 0,
        reorderLevel: dto.reorderLevel || 0,
      },
    });
  }

  async createCategory(name: string, parentId?: string) {
    return this.prisma.category.create({
      data: { name, parentId },
    });
  }

  async createBrand(name: string) {
    return this.prisma.brand.create({
      data: { name },
    });
  }
}
