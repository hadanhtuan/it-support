// import { omit } from 'lodash';
// import data from './vn/raw/raw-provinces.json';

// export function convertAddress(): void {
//   const level1: { id: string; name: string; type: string; parentId: string | null; slug?: string }[] = [];
//   const level2: { id: string; parentId: string; name: string; type: string; slug?: string }[] = [];

//   console.log(Object.values(data));
//   Object.values(data).forEach((item: any) => {
//     level1.push({
//       id: item.code,
//       name: item.name_with_type,
//       type: item.type,
//       parentId: item.parent_code,
//       slug: item.slug
//     });
//   });
//   console.log('provinces.json', level1);
// }
